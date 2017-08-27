'use strict';

const DAO = require('./modules/dao.js');
const Logger = require('./modules/logger.js');
const GPS = require('./modules/gps.js');

class App {
	state = {
		currentStation: null,
		transportID: null,
		paymentAmount: null
	}

	initDB() {
		DAO.connect();
	}

	initState() {
		const appInitData = DAO.getAppInitData();
		this.state.currentStation = appInitData.currentStation;
		this.state.transportID = appInitData.transportID;
		this.state.paymentAmount = appInitData.paymentAmount;
	}

	initGPS() {
		GPS.init(this.state);
	} 
};

const app = new App();
app.initDB();
app.initState();
app.initGPS();