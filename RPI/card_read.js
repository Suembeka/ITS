'use strict';

const Arduino = require('./modules/arduino.js');
const Notifier = require("./modules/notifier.js");

class App {
    init() {
        console.info("Init Arduino");
        Arduino.init();
        for (var i = 0; i < Arduino.length; i++) {
            Arduino[i].on('cardFound', (card, arduino) => this.showCardInfo(card, arduino));
        }
    }

    showCardInfo(card, arduino) {
        console.info('Initial card data :');
        console.dir(card);

        setTimeout(function() {
            Notifier.notify(arduino, '0');
            arduino.currentCard = null;
        }, 5000)
    }
};

new App().init();

process.on('unhandledRejection', (reason, p) => {
    console.info('Unhandled Rejection at: Promise', p, 'reason:', reason);
    //DAO.rollbackTransaction();
});
