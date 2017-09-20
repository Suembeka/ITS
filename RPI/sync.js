'use strict';

const Request = require('request');
const DAO = require('./modules/dao.js');
const Net = require('./modules/net.js');
const Logger = require('./modules/logger.js')(module);

// TODO: Add package scheme
class Sync {
    constructor() {
        this.state = {
            transportID: null
        };
    }

    init() {
        Promise.resolve()
            .then(() => this.initDB())
            .then(() => this.initState())
            .then(() => this.initSyncTimer());
    }

    initDB() {
        return DAO.connect();
    }

    initState() {
        return DAO.getTransportID()
            .then((transportID) => {
                this.state.transportID = transportID;
            });
    }

    initSyncTimer() {
        //this.timer = setTimeout(syncNow, 60 * 1000);
        this.syncNow();
    }

    syncNow() {
        if(!Net.checkConnection()) { return; }
        var transportID = this.transportID;

        this.selectDataForSync()
            .then(() => {
                return Net.sendRequest({
                    'type': 'start_sync',
                    'data': { 'transport_id': transportID }
                });
            })
            .then((response) => {
                if(response.type == 'accept_sync') {
                    this.state.lastSyncID = response.data.last_transaction_id;
                    this.state.transactions = this.state.transactions
                        .filter((tr) => tr.id > this.state.lastSyncID);

                    this.sendAllData();
                }
            });
    }

    selectDataForSync() {
        return DAO.getDataForSync()
            .then((data) => {
                if(data.length == 0) {
                    return Promise.reject();
                } else {
                    this.state.transactions = data;
                    return Promise.resolve();
                }
            });
    }

    sendAllData() {
        const packetSize = 10;
        const partsAmount = Math.ceil(this.state.transactions.length / packetSize);
        const tries = 5;

        let sendPromise = Promise.resolve();
        for(let part = 1; part <= partsAmount; part++) {
            let packet = this.state.transactions.slice((packetSize * (part - 1)), (packetSize * part));
            sendPromise = sendPromise
                .then(() => {
                    Logger.info('sendData');
                    return this.sendData(packet, tries);
                })
                .catch(() => {
                    Logger.info('send sequence failed');
                });
        }

        // After all sends
        // return sendPromise;
    }

    sendData(packet, tries) {
        //Logger.info('sendData try:', tries);
        if(tries < 0) {
            return Promise.reject();
        }
        return this.sendPacket(packet)
            .then(
            // Successful
            () => {
                //Logger.info('sendPacket successful');
                return DAO.confirmTransactions(packet);
            },
            // Not successful
            () => {
                //Logger.info('sendPacket not successful');
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(this.sendData(packet, tries - 1));
                    }, 1000); // Pause between requests if fails
                });
            });
    }

    sendPacket(transactions) {
        //return Promise.reject(); // REMOVE
        return Net.sendRequest({
            'type': 'send_data',
            'data': {
                'transactions': transactions
            }
        })
        .then((response) => {
            //Logger.info(response);
            if(response.type == 'sync_status') {
                if(response.data.status == 200) {
                    return Promise.resolve();
                }
                else if(response.data.status == 500) {
                    return Promise.reject();
                }
            }
        });
    }
}

const sync = new Sync();
sync.init();

process.on('unhandledRejection', (reason, p) => {
	Logger.info('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
