'use strict';

const Net = require('./net.js');
const Logger = require('./logger.js')(module);

async function fn() {
	let response = await Net.sendRequest({
		'type': 'start_sync',
		'data': { 'transport_id': '1' }
	});

	Logger.info('Response:' + JSON.stringify(response));
}

fn();

setInterval(()=>{}, 5000);



process.on('unhandledRejection', (reason, p) => {
	Logger.info('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
