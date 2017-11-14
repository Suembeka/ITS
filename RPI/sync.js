'use strict';

const DAO = require('./modules/dao.js');
const Net = require('./modules/net.js');
const Logger = require('./modules/logger.js')(module);

class Sync {
    constructor() {
        this.state = {};
		this.state.transportID = null;
    }

    async init() {
        // Connect to database
        await DAO.connect();

        // Retrieve ID of current transport
        this.state.transportID = await DAO.getTransportID();

        // Init repeatable sync
        //this.timer = setTimeout(() => this.prepareSyncData, 60 * 1000 * 0);
		this.prepareSyncData();
    }

    async prepareSyncData() {
		Logger.info("Prepare sync");

        // Check internet connection
        let connectionExist = await Net.checkConnection();
        if(!connectionExist) { return; }

        let transportID = this.state.transportID;

        // Retrieve transactions that we need to send
        let transactions = await DAO.getTransactions();
        if(transactions.length == 0) { return; }

		transactions = transactions.map(function(tr) {
			let transac = tr.transaction_id.toString('hex');
			tr.transaction_id = [transac.substr(0, 8), transac.substr(8, 4), transac.substr(12, 4), transac.substr(16, 4), transac.substr(20, 4)].join("-");
			
			tr.time = new Date(tr.time).getTime();
			
			return Object.assign({}, tr);
		});
		
		console.log(transactions);
		//return;
		
        // Start sync
		Logger.info("Start sync");
		let response = await Net.sendRequest({
			'type': 'start_sync',
			'data': { 'transport_id': transportID }
		});

		Logger.info('Start sync Response:' + JSON.stringify(response));

        if(response.type == 'accept_sync') {
            // Get last transaction id that was sent
            let serverLastSyncID = response.data.last_transaction_id;
            transactions = transactions.filter((tr) => tr.id > serverLastSyncID);
			let lastSyncID = transactions[transactions.length-1].id;
			
			console.log(serverLastSyncID, lastSyncID, '\n');
			
			console.log(transactions);

            // Send transactions to server
            let success = await this.sync(transactions);
			
			Logger.info('Success:' + success);

            if(success) {
                await DAO.saveLastSyncID(lastSyncID);
            }
        }
    }

    async sync(transactions) {
		Logger.info("Send data");
        let response = await Net.sendRequest({
            'type': 'send_data',
            'data': {
                'transactions': transactions
            }
        });

		Logger.info('Sync Response:' + JSON.stringify(response));

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
