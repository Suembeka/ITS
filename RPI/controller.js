'use strict';

const DAO = require('./modules/dao.js');
const Logger = require('./modules/logger.js')(module);
const GPS = require('./modules/gps.js');
const Arduino = require('./modules/arduino.js');
const Notifier = require("./modules/notifier.js");

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

    init() {
        Logger.info("Init DB");
        DAO.init().then(() => {
            Logger.info("Init GPS");
            setInterval(function () {
                GPS.processGPS(DAO);
            }, 1000);
        });

        Logger.info("Init Arduino");
        Arduino.init();
        for (var i = 0; i < Arduino.length; i++) {
            Arduino[i].on('cardFound', (card, arduino) => this.checkPayment(card, arduino));
            Arduino[i].on('writeStatus', (status, arduinoID) => this.acceptTranscation(status, arduinoID));
        }
    }

    initState() {
        // const appInitData = DAO.getAppInitData();
        // setCurrentStation(appInitData.currentStation);
        // setTransportID(appInitData.transportID);
        // setPaymentAmount(appInitData.paymentAmount);
    }

    checkPayment(card, arduino) {
        Logger.info("checkPayment has been called");
        DAO.checkCircle(card.cardID, arduino).then(function (arduino) {
            Logger.info('Initial card data :');
            Logger.info(card);

            if (!checkHash()) {
                return;
            }

            function checkHash() {
                // Проверка на корректность хеша
                return true;
            }

            function checkTime(card) {
                if (card.expireTime < Date.now()) {
                    Logger.info("Время на карте истекло");
                    return false;
                } else {
                    return true;
                }
            }

            function checkBalance(card) {
                Logger.info("Checking balance...");
                if (card.balance < DAO.state.paymentAmount) {
                    Logger.info("Недостаточно средств на карте");
                    return false;
                } else {
                    return true;
                }
            }

            function changeTime(card) {
                Logger.info("Changing time");
                card.lastPaytime = Date.now();
            }

            function changeBalance(card) {
                Logger.info("Changing balance");
                card.balance = card.balance - DAO.state.paymentAmount;
                card.lastPaytime = Date.now();
            }

            function generateNewHash() {

            }

            // Снятие средств
            if (checkTime(card)) {
                changeTime(card);
                arduino.currentCard = card;
                Notifier.notify(arduino, '3');
            } else if (checkBalance(card)) {
                Logger.info("Balance has been changed");
                changeBalance(card);
                arduino.currentCard = card;
            }

            generateNewHash();

            if (arduino.currentCard) {
                DAO.startTransaction(card.cardID, card.cardType).then((time) => {
                    Logger.info('Changed card data :');

                    card.lastPaytime = new Date(time).getTime() / 1000.0;
                    //Logger.info("card.lastPaytime = " + card.lastPaytime);
                    Logger.info(card);
                    arduino.write(card);
                });
            } else {
                Notifier.notify(arduino, '2');
            }

            /*Logger.info("Изменение данных...");
		var myDate="26-10-2017";
		myDate=myDate.split("-");
		var newDate=myDate[1]+","+myDate[0]+","+myDate[2];

	            card = {
	                cardType: 1,
	                balance: 0,
	                expireTime: (new Date(newDate).getTime()),
	                lastTransportID: 255,
	                lastPaytime: Date.now()
	            };
	            arduino.write(card, 1);*/

        }).catch(function (err) {
            Logger.error(err);
            Notifier.notify(arduino, '4');
            return;
        });
    }

    acceptTranscation(status, arduinoID) {
        Arduino[arduinoID].currentCard = null;
        if (status) {
            DAO.commitTransaction();
            Notifier.notify(Arduino[arduinoID], '0');
        } else {
            DAO.rollbackTransaction();
            Notifier.notify(Arduino[arduinoID], '1');
        }
    }
};

new App().init();


process.on('unhandledRejection', (reason, p) => {
    Logger.info('Unhandled Rejection at: Promise', p, 'reason:', reason);
    //DAO.rollbackTransaction();
});
