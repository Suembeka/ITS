'use strict';

const DAO = require('./modules/dao.js');
const Logger = require('./modules/logger.js')(module);
const GPS = require('./modules/gps.js');
const Arduino = require('./modules/arduino.js');

class App {
    getCurrentStation() {
        return this.currentStation;
    }
    getTransportID() {
        return this.transportID;
    }
    getPaymentAmount() {
        //return this.paymentAmount;
        return DAO.state.paymentAmount;
    }

    setCurrentStation(val) {
        currentStation = val;
    }
    setTransportID(val) {
        transportID = val;
    }
    setPaymentAmount(val) {
        paymentAmount = val;
    }

    initDB() {
        DAO.init();
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
        Arduino.init();
        for (var i = 0; i < Arduino.length; i++) {
            Arduino[i].getValues().on('cardFound', this.processPayment);
            Arduino[i].getValues().on('writeStatus', this.acceptTranscation);
        }
    }

    processPayment(card) {
        if (Date.now() - card.getInfo().lastPaytime < 10000) {
            Logger.info('Reject');
            return;
        }
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
    Logger.info('Unhandled Rejection at: Promise', p, 'reason:', reason);
    DAO.trRollback();
});
