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
    write(card) {
		function getHex(decimal) {
			var binStr = decimal.toString(2);
			if(binStr.length < 8) { binStr = binStr.padStart(8, '0'); }
			if(binStr.length < 16) { binStr = binStr.padStart(16, '0'); }
			if(binStr.length < 24) { binStr = binStr.padStart(24, '0'); }
			if(binStr.length < 32) { binStr = binStr.padStart(32, '0'); }
			if(binStr.length < 40) { binStr = binStr.padStart(40, '0'); }
			if(binStr.length < 48) { binStr = binStr.padStart(48, '0'); }
			
			return binStr.split(/(.{})/).filter(function(el){ return el.length > 0; });
		}
		
		Parser.writeToCard({
			'04': getHex(card.cardType)
					.concat(getHex(card.expireTime))
					.concat(new Array(9).fill('00')),
			'05': getHex(card.lastTransportID)
					.concat(getHex(card.balance))
					.concat(getHex(card.lastPaytime))
					.concat(new Array(5).fill('00'))
		});
    }

    processCard(cardBlocks) {
        function getInt(bytes) {
			bytes.map(function(hexByte) {
				return parserInt(hexByte, 16).toString(2);
			});
			return parseInt(bytes.join(''), 2);
        }

        var card = Object.assign({}, CardTemplate);
        card.cardID = getInt(cardBlocks['00'].slice(0, 4);
        card.cardType = getInt(cardBlocks['04'].slice(0, 1));
        card.expireTime = getInt(cardBlocks['04'].slice(1, 1 + 6));
        card.lastTransportID = getInt(cardBlocks['05'].slice(0, 2));
        card.balance = getInt(cardBlocks['05'].slice(2, 2 + 3));
        card.lastPaytime = getInt(cardBlocks['05'].slice(5, 5 + 6));

        //console.log(cardBlocks);
        //console.log(card);
        arduino.emit('payment', card);
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