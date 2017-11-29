'use strict';

const readline = require('readline');
const Arduino = require('./modules/arduino.js');
const Notifier = require("./modules/notifier.js");

let isFound = false;

class App {
    init() {
        console.info("Init Arduino");
        Arduino.init();
        for (var i = 0; i < Arduino.length; i++) {
            Arduino[i].on('cardFound', (card, arduino) => this.showCardInfo(card, arduino));
            Arduino[i].on('writeStatus', (status, arduinoID) => this.showWriteStatus(status, arduinoID));
        }
    }

    showCardInfo(card, arduino) {
        if(isFound) return;
        isFound = true;

        console.info('Card Found');
        console.dir(card);

        let cardChanged = false;
        let mutableKeys = ['balance', 'cardType', 'expireTime'];
        let currentIndex = 0;

        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log(mutableKeys[currentIndex] + ': ' + card[mutableKeys[currentIndex]]);

        rl.on('line', (userVal) => {
            //console.log(`User Value: ${userVal} ${typeof(userVal)}`);
            userVal = parseInt(userVal);
            if(userVal != card[mutableKeys[currentIndex]]) {
                card[mutableKeys[currentIndex]] = parseInt(userVal);
                cardChanged = true;
            }
            currentIndex++;

            if(currentIndex >= mutableKeys.length) {
                rl.close();
                this.applyToCard(card, arduino, cardChanged);
                return;
            } else {
                console.log(mutableKeys[currentIndex] + ': ' + card[mutableKeys[currentIndex]]);
            }
        });
    }

    applyToCard(card, arduino, isChanged) {
        if(isChanged) {
            arduino.write(card);
        } else {
            Notifier.notify(arduino, '0');
        }
        arduino.currentCard = null;
        isFound = false;
    }

    showWriteStatus(status, arduino) {
        console.info('Status: ' + status);
    }
};

new App().init();

process.on('unhandledRejection', (reason, p) => {
    console.info('Unhandled Rejection at: Promise', p, 'reason:', reason);
    //DAO.rollbackTransaction();
});
