'use strict';

const DAO = require('./modules/dao.js');
const Net = require('./modules/net.js');
const Logger = require('./modules/logger.js')(module);

class Sync {
    constructor() {
        this.state = {
            transportID: null
        };
    }

    async init() {
        // Connect to database
        await DAO.connect();

        // Retrieve ID of current transport
        this.state.transportID = await DAO.getTransportID();

        // Init repeatable sync
        //this.timer = setTimeout(prepareSyncData, 60 * 1000);
    }

    async prepareSyncData() {
        // Check internet connection
        let connectionExist = await Net.checkConnection();
        if(!connectionExist) { return; }

        let transportID = this.state.transportID;

        // Retrieve transactions that we need to send
        let transactions = await DAO.getTransactions();
        if(transactions.length == 0) { return; }

        // Start sync
        let response = await Net.sendRequest({
            'type': 'start_sync',
            'data': { 'transport_id': transportID }
        });

        if(response.type == 'accept_sync') {
            // Get last transaction id that was sent
            let lastSyncID = response.data.last_transaction_id;
            transactions = transactions.filter((tr) => tr.id > lastSyncID);

            // Send transactions to server
            let success = await this.sync(transactions);
            if(success) {
                await DAO.saveLastSyncID(lastSyncID);
            }
        }
    }

    async sync(transactions) {
        let response = await Net.sendRequest({
            'type': 'send_data',
            'data': {
                'transactions': JSON.stringify(transactions)
            }
        });

        if(response.type == 'sync_status') {
            if(response.data.status == 200) {
                return Promise.resolve();
            }
            else if(response.data.status == 500) {
                return Promise.reject();
            }
        }
    }
}

new Sync().init();

process.on('unhandledRejection', (reason, p) => {
	Logger.info('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
