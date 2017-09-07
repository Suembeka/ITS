'use strict';

// Polyfills
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return String(this) + padString.slice(0, targetLength);
        }
    };
}


const SerialPort = require('serialport');
const Logger = require('./logger');
const EventEmitter = require('events');
const Parser = require('./parser');
const DAO = require('./dao.js');
var shell = require('shelljs');

var availablePorts = shell.ls('-l', '/dev/ttyACM*');
var allSerials = [];

class Card {
    constructor(cardID, cardType, expireTime, lastTransportID, balance, lastPaytime) {
        this.cardID = cardID;
        this.cardType = cardType;
        this.expireTime = expireTime;
        this.lastTransportID = lastTransportID;
        this.balance = balance;
        this.lastPaytime = lastPaytime;
    }

    getInfo() {
        return this;
    }
};

class Arduino extends EventEmitter {
    setValues(arduinoID, serial, serialParser) {
        this.arduinoID = arduinoID;
        this.serial = serial;
        this.serialParser = serialParser;
    }

    getValues() {
        return this;
    }

    write(card) {
        function getHex(decimal, sizeInBytes) {
            var binStr = decimal.toString(2);
            binStr = binStr.padStart(sizeInBytes * 8, '0');
            return binStr.split(/(.{8})/)
                .filter(function (el) {
                    return el.length > 0;
                })
                .map(function (el) {
                    return parseInt(el, 2).toString(16).toUpperCase().padStart(2, '0');
                });
        }

        var encodedData = Parser.encode({
            '04': getHex(card.cardType, 1)
                .concat(getHex(card.expireTime, 6))
                .join('').padEnd(32, '0'),
            '05': getHex(card.lastTransportID, 2)
                .concat(getHex(card.balance, 3))
                .concat(getHex(card.lastPaytime, 6))
                .join('').padEnd(32, '0')
        })

        this.serial.write(encodedData, function () {
            Logger.log({
                file: __filename,
                msg: 'Write to Card'
            });
        });
    }

    processCard(cardBlocks) {
        var changed = false;
        for (var block in cardBlocks) {
            cardBlocks[block] = cardBlocks[block].split(/(.{2})/).filter(function (el) {
                return el.length > 0;
            });
        }

        function getInt(bytes) {
            //console.log(bytes);
            bytes = bytes.map(function (hexByte) {
                return parseInt(hexByte, 16).toString(2).padStart(8, '0');
            });
            return parseInt(bytes.join(''), 2);
        }

        var card = new Card(getInt(cardBlocks['00'].slice(0, 4)), getInt(cardBlocks['04'].slice(0, 1)), getInt(cardBlocks['04'].slice(1, 1 + 6)), getInt(cardBlocks['05'].slice(0, 2)), getInt(cardBlocks['05'].slice(2, 2 + 3)), getInt(cardBlocks['05'].slice(5, 5 + 6)));

        /*if (Date.now() - card.getInfo().lastPaytime < 10000) {
            console.log('Reject');
            return;
        }*/

        DAO.checkCircle(card.getInfo().cardID, this).then(function (arduino) {
            console.log('Initial card data :');
            console.log(card);
            //this.emit('cardFound', card, this.arduinoID);


            function checkHash() {
                //        Проверка на корректность хеша
                return true;
            }

            function checkTime(card) {
                if (card.getInfo().expireTime < Date.now()) {
                    Logger.writeLog("Время на карте истекло");
                    Logger.log({
                        file: __filename,
                        msg: 'Время на карте истекло'
                    });

                    /*Logger.writeLog("Изменение данных...");
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

                    return false;
                } else {
                    return true;
                }
            }

            function checkBalance(card) {
                if (card.getInfo().balance < DAO.state.paymentAmount) {
                    Logger.writeLog("Недостаточно средств на карте");
                    return false;
                } else {
                    return true;
                }
            }

            function changeTime(card) {
                card.getInfo().lastPaytime = Date.now();
            }

            function changeBalance(card) {
                card.getInfo().balance = card.getInfo().balance - DAO.state.paymentAmount;
                card.getInfo().lastPaytime = Date.now();
            }

            function generateNewHash() {}


            //        Проверка
            if (checkHash()) {
                //        Снятие средств
                if (checkTime(card)) {
                    changeTime(card);
                    changed = true;
                } else if (checkBalance(card)) {
                    changeBalance(card);
                    changed = true;
                }
            }

            //generateNewHash();

            if (changed) {
                console.log('Changed card data :');
                console.log(card);
                arduino.write(card);
                arduino.makeTransaction(card);
            }
        }).catch(function (err) {
            console.log(err);
            return;
        });
    }

    makeTransaction(card) {
        DAO.setTransaction(card.getInfo().cardID, card.getInfo().cardType, card.getInfo().lastPaytime);
    }
};


allSerials.init = function () {
    for (var i = 0; i < availablePorts.length; i++) {
        var serial = new SerialPort(availablePorts[i].name, {
            baudRate: 115200
        });

        var serialParser = serial.pipe(new SerialPort.parsers.Readline());

        serialParser.on('open', function () {
            Logger.log({
                file: __filename,
                msg: 'Serial Port Opened'
            });
        }).on('error', function (err) {
            Logger.log({
                file: __filename,
                msg: 'Serial Port Open Fail',
                err: err
            });
        }).on('data', function (data) {
            for (var i = 0; i < allSerials.length; i++) {
                if (allSerials[i].getValues().serialParser === this) {
                    Parser.parse(data, allSerials[i].getValues().arduinoID); // second is arduino id
                }
            }
        });

        var obj = new Arduino();
        obj.setValues(i, serial, serialParser);

        allSerials[i] = obj;
    }

    Parser.on('cardFound', function (cardData, arduinoID) {
        console.log("________________________________\n");
        console.log("arduinoID = " + arduinoID)
        allSerials[arduinoID].processCard(cardData, arduinoID);
    });

    Parser.on('writeStatus', function (status, arduinoID) {
        allSerials[arduinoID].emit('writeStatus', status, arduinoID);
    });
}


/*const Serial = new SerialPort('COM5', {
    baudRate: 115200
});*/

/*const Serial = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200
});

const SerialParser = Serial.pipe(new SerialPort.parsers.Readline());*/

//var Serial2 = new SerialPort("COM5", {
//    baudrate: 115200,
//    parser: SerialPort.parsers.Readline
//});

//var cardFromArduino1;

/*SerialParser.on('open', function () {
    Logger.log({
        file: __filename,
        msg: 'Serial Port Opened'
    });
}).on('error', function (err) {
    Logger.log({
        file: __filename,
        msg: 'Serial Port Open Fail',
        err: err
    });
}).on('data', function (data) {
    Parser.parse(data, 1); // 1 = arduino id
});*/

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

module.exports = allSerials;
