'use strict';

const Request = require('request');
const DAO = require('./modules/dao.js');
const Net = require('./modules/net_module.js');
const Logger = require('./modules/logger.js');

// TODO: Add package scheme
class Sync {
    constructor() {
        this.state = {};
    }

    init() {
        new Promise().resolve()
            .then(initDB)
            .then(initState)
            .then(initSyncTimer);
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
        this.timer = setTimeout(syncNow, 60 * 1000);
    }

    syncNow() {
        if(!Net.checkConnection()) { return; }
        var transportID = this.transportID;

        selectDataForSync()
            .then(() => {
                return Net.sendRequest({
                    'type': 'start_sync',
                    'data': { 'transport_id': transportID }
                });
            })
            .then((response) => {
                if(response.type == 'accept_sync') {
                    this.state.lastSyncID = response.last_transaction_id;
                    this.state.transactions = this.state.transactions
                        .filter((tr) => tr.id > this.state.lastSyncID);

                    sendAllData();
                }
            });
    }

    sendAllData() {
        const packageSize = 10;
        let package = transactions.slice((packageSize * (part - 1)), (packageSize * part));;
        const partsAmount = Math.ceil(transactions.length / packageSize);
        const tries = 5;

        let sendPromise = Promise.resolve();
        for(let part = 1; part <= partsAmount; part++) {
            sendPromise = sendPromise.then(() => {
                return sendDataPart(package, tries);
            });
        }

        // After all sends
        // return sendPromise;
    }

    sendData(package, tries) {
        return sendPackage(package)
            .then(
            // Successful
            () => {
                return DAO.confirmTransactions(package);
            },
            // Not successful
            () => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(sendData(package, tries - 1));
                    }, 5000); // Pause between requests if fails
                });
            });
    }

    sendPackage(transactions, try = 0) {
        return Net.sendRequest({
            'type': 'send_data',
            'data': {
                'transactions': transactions
            }
        })
        .then((response) => {
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

    selectDataForSync() {
        return DAO.getDataForSync()
            .then((data) = > {
                if(data.length == 0) {
                    return Promise.reject();
                } else {
                    this.state.transactions = data;
                    return Promise.resolve();
                }
            });
    }
}

const sync = new Sync();
sync.init();

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
