'use strict';

// Polyfills
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return String(this) + padString.slice(0,targetLength);
        }
    };
}


const SerialPort = require('serialport');
const Logger = require('./logger');
const EventEmitter = require('events');
const Parser = require('./parser');

Logger.output = "console";

// TODO: add port finder
const Serial = new SerialPort('COM5', {
    baudRate: 115200
});

/*const Serial = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200
});*/

const SerialParser =  Serial.pipe(new SerialPort.parsers.Readline());

//var Serial2 = new SerialPort("COM5", {
//    baudrate: 115200,
//    parser: SerialPort.parsers.Readline
//});

// TODO: add card scheme
class Arduino extends EventEmitter {
    write(card, arduinoID) {
		function getHex(decimal, sizeInBytes) {
            var binStr = decimal.toString(2);

            binStr = binStr.padStart(sizeInBytes * 8, '0');

            return binStr.split(/(.{8})/)
                            .filter(function(el){ return el.length > 0; })
                            .map(function(el) {
                                return parseInt(el, 2).toString(16).toUpperCase().padStart(2, '0');
                            });
        }

        var encodedData = Parser.encode({
                '04': getHex(card.cardType, 2)
                        .concat(getHex(card.expireTime, 6))
                        .join('').padEnd(32, '0'),
                '05': getHex(card.lastTransportID, 2)
                        .concat(getHex(card.balance, 3))
                        .concat(getHex(card.lastPaytime, 6))
                        .join('').padEnd(32, '0')
        })

        if(arduinoID == 1) {
            Serial.write(encodedData, function() {
                Logger.log({file: __filename, msg: 'Write to Card'});
            });
        } else {}
    }

    processCard(cardBlocks, arduinoID) {
        //console.log(cardBlocks);

        for(var block in cardBlocks) {
            cardBlocks[block] = cardBlocks[block].split(/(.{2})/).filter(function(el){ return el.length > 0; });
        }

        function getInt(bytes) {
            //console.log(bytes);
            bytes = bytes.map(function(hexByte) {
                return parseInt(hexByte, 16).toString(2).padStart(8, '0');
            });
            return parseInt(bytes.join(''), 2);
        }

        var card = {
            cardID: getInt(cardBlocks['00'].slice(0, 4)),
            cardType: getInt(cardBlocks['04'].slice(0, 1)),
            expireTime: getInt(cardBlocks['04'].slice(1, 1 + 6)),
            lastTransportID: getInt(cardBlocks['05'].slice(0, 2)),
            balance: getInt(cardBlocks['05'].slice(2, 2 + 3)),
            lastPaytime: getInt(cardBlocks['05'].slice(5, 5 + 6))
        }

        this.emit('cardFound', card, arduinoID);
    }
};

var arduino = new Arduino();

Parser.on('cardFound', function(cardData, arduinoID) {
    arduino.processCard(cardData, arduinoID);
});

Parser.on('writeStatus', function(status, arduinoID) {
    arduino.emit('writeStatus', status, arduinoID);
});


SerialParser.on('open', function () {
    Logger.log({file: __filename, msg: 'Serial Port Opened'});
}).on('error', function (err) {
    Logger.log({file: __filename, msg: 'Serial Port Open Fail', err: err});
}).on('data', function(data) {
    Parser.parse(data, 1); // 1 = arduino id
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
