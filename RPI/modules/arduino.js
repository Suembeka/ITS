'use strict';

const SerialPort = require('serialport');
const Logger = require('./logger');
const EventEmitter = require('events');
const Parser = require('./parser');

Logger.output = "console";

// TODO: add port finder
const Serial = new SerialPort('COM5', {
    baudRate: 115200
});

const SerialParser =  Serial.pipe(new SerialPort.parsers.Readline());

//var Serial2 = new SerialPort("COM5", {
//    baudrate: 115200,
//    parser: SerialPort.parsers.Readline
//});

class Arduino extends EventEmitter {
    write(payment) {
        console.log(payment);
        setTimeout(function() {
            arduino.emit('writeStatus', payment, Math.random() > 0.8);
        }, 1000);
    }

    processCard(cardBlocks) {
        function get(data) {
            return parseInt(data.map(function(sym) {
                return String.fromCharCode(parseInt(sym, 16));
            }).join(''), 10);
        }

        var card = Object.assign({}, CardTemplate);
        card.cardID = parseInt(cardBlocks['00'].slice(0, 4).join(''), 16);
        card.cardType = get(cardBlocks['04'].slice(0, 1));
        card.expireTime = get(cardBlocks['04'].slice(1, 1 + 6));
        card.lastTransportID = get(cardBlocks['05'].slice(0, 2));
        card.balance = get(cardBlocks['05'].slice(2, 2 + 3));
        card.lastPaytime = get(cardBlocks['05'].slice(5, 5 + 6));

        console.log(cardBlocks);
        console.log(card);
        //arduino.emit('payment', card);
    }
};

var arduino = new Arduino();

var CardTemplate = {
    cardID: 0,
    cardType: 0,
    balance: 0,
    expireTime: 0,
    lastTransportID: 0,
    lastPaytime: 0
};


Parser.on('cardFound', function(cardData) {
    arduino.processCard(cardData);
});


SerialParser.on('open', function () {
    Logger.log({file: __filename, msg: 'Serial Port Opened'});
}).on('error', function (err) {
    Logger.log({file: __filename, msg: 'Serial Port Open Fail', err: err});
}).on('data', function(data) {
    Parser.parse(data);
});

/*
// Testing
function generatePayment() {
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return {
        id: Math.random() > 0.5 ? 1 : 2,
        card: {
            cardID: getRandomInt(100, 1000),
            cardType: getRandomInt(1, 8),
            balance: getRandomInt(0, 10000),
            expireTime: Date.now() + getRandomInt(-86400*30, 86400*30)
        }
    };
}

setInterval(function() {
    arduino.emit('payment', generatePayment());
}, 2000);
*/

module.exports = arduino;