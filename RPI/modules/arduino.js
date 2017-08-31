'use strict';

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

const SerialParser =  Serial.pipe(new SerialPort.parsers.Readline());

//var Serial2 = new SerialPort("COM5", {
//    baudrate: 115200,
//    parser: SerialPort.parsers.Readline
//});

class Arduino extends EventEmitter {
    write(card) {
		function getHex(decimal) {
            var binStr = decimal.toString(2);
            var sizeInBytes = Math.ceil(Math.log2(decimal) / 8);

            binStr = binStr.padStart(sizeInBytes * 8, '0');

            return binStr.split(/(.{8})/)
                            .filter(function(el){ return el.length > 0; })
                            .map(function(el) {
                                return parseInt(el, 2).toString(16).toUpperCase().padStart(2, '0');
                            });
        }

		this.writeToCard(
            Parser.encode({
                '04': getHex(card.cardType)
                        .concat(getHex(card.expireTime))
                        .join('').padEnd(32, '0'),
                '05': getHex(card.lastTransportID)
                        .concat(getHex(card.balance))
                        .concat(getHex(card.lastPaytime))
                        .join('').padEnd(32, '0')
            })
        );
    }

    writeToCard(data) {
        console.log(data);
        Serial.write(data, function() {
            Logger.log({file: __filename, msg: 'Write to Card'});
        });
    }

    processCard(cardBlocks) {
        for(var block in cardBlocks) {
            cardBlocks[block] = cardBlocks[block].split(/(.{2})/).filter(function(el){ return el.length > 0; });
        }

        function getInt(bytes) {
			bytes.map(function(hexByte) {
				return parseInt(hexByte, 16).toString(2);
			});
			return parseInt(bytes.join(''), 2);
        }

        var card = Object.assign({}, CardTemplate);
        card.cardID = getInt(cardBlocks['00'].slice(0, 4));
        card.cardType = getInt(cardBlocks['04'].slice(0, 1));
        card.expireTime = getInt(cardBlocks['04'].slice(1, 1 + 6));
        card.lastTransportID = getInt(cardBlocks['05'].slice(0, 2));
        card.balance = getInt(cardBlocks['05'].slice(2, 2 + 3));
        card.lastPaytime = getInt(cardBlocks['05'].slice(5, 5 + 6));

        this.emit('payment', card);
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

Parser.on('writeStatus', function(status) {
    arduino.emit('writeStatus', status);
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