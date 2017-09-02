'use strict';

const DAO = require('./modules/dao.js');
const Logger = require('./modules/logger.js');
const GPS = require('./modules/gps.js');
const Arduino = require('./modules/arduino.js');

class App {
	getCurrentStation(){ return this.currentStation; }
	getTransportID(){ return this.transportID; }
	getPaymentAmount(){ return this.paymentAmount; }

	setCurrentStation(val){ currentStation = val; }
	setTransportID(val){ transportID = val; }
	setPaymentAmount(val){ paymentAmount = val; }

	initDB() {
		DAO.connect();
	}

	initState() {
		// const appInitData = DAO.getAppInitData();
		// setCurrentStation(appInitData.currentStation);
		// setTransportID(appInitData.transportID);
		// setPaymentAmount(appInitData.paymentAmount);
	}

	initGPS() {
    setInterval(function () {
        GPS.processGPS(DAO);
    }, 1000);
	}

	initArduino() {
		Arduino.on('cardFound', (card) => this.processPayment(card));
		Arduino.on('writeStatus', (status) => this.acceptTranscation(status));
	}

	processPayment(card) {
		console.log(card);
		if(Date.now() - card.lastPaytime < 5000) { console.log('Reject'); return; }

		card = {
			cardType: 1,
			balance: 5000,
			expireTime: 1506077646044,
			lastTransportID: 123,
			lastPaytime: Date.now()
		};
		Arduino.write(card);
	}

	acceptTranscation(paymentStatus) {
		//paymentStatus = true or false
	}
};

const app = new App();
app.initDB();
app.initState();
app.initGPS();
app.initArduino();

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
