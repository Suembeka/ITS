'use strict';

const DAO = require('./modules/dao.js');
const Logger = require('./modules/logger.js');
//const GPS = require('./modules/gps.js');
const Arduino = require('./modules/arduino.js');

class App {
	getCurrentStation(){ return this.currentStation; }
	getTransportID(){ return this.transportID; }
	getPaymentAmount(){ return this.paymentAmount; }
	
	setCurrentStation(val){ currentStation = val; }
	setTransportID(val){ transportID = val; }
	setPaymentAmount(val){ paymentAmount = val; }

	initDB() {
		// DAO.connect();
	}

	initState() {
		// const appInitData = DAO.getAppInitData();
		// setCurrentStation(appInitData.currentStation);
		// setTransportID(appInitData.transportID);
		// setPaymentAmount(appInitData.paymentAmount);
	}

	initGPS() {
		// GPS.init(this.state);
	}
	
	initArduino() {
		Arduino.on('cardFound', (card) => this.processPayment(card));
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
};

const app = new App();
app.initDB();
app.initState();
app.initGPS();
app.initArduino();

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	// application specific logging, throwing an error, or other logic here
  });