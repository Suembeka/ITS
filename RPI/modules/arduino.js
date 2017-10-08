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
const Logger = require('./logger')(module);
const EventEmitter = require('events');
const Parser = require('./parser');
const DAO = require('./dao.js');
var shell = require('shelljs');
const Card = require('./card.class.js');

var availablePorts = shell.ls('-l', '/dev/ttyACM*');
var allSerials = [];

class Arduino extends EventEmitter {
    setValues(arduinoID, serial, serialParser) {
        this.arduinoID = arduinoID;
        this.serial = serial;
        this.serialParser = serialParser;
    }

    /*constructor(arduinoId, serial, serialParser) {
        this.arduinoID = arduinoId;
        this.serial = serial;
        this.serialParser = serialParser;
        this.currentCard = null;
    }*/

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
            Logger.info("Write to Card");
            //DAO.trCommit();
        });
    }

    processCard(cardBlocks) {
        Logger.info("Processing card...");
        var changed = false;
        for (var block in cardBlocks) {
            cardBlocks[block] = cardBlocks[block].split(/(.{2})/).filter(function (el) {
                return el.length > 0;
            });
        }

        function getInt(bytes) {
            //Logger.info(bytes);
            bytes = bytes.map(function (hexByte) {
                return parseInt(hexByte, 16).toString(2).padStart(8, '0');
            });
            return parseInt(bytes.join(''), 2);
        }

        this.emit('cardFound', new Card(
            getInt(cardBlocks['00'].slice(0, 4)),
            getInt(cardBlocks['04'].slice(0, 1)),
            getInt(cardBlocks['04'].slice(1, 1 + 6)),
            getInt(cardBlocks['05'].slice(0, 2)),
            getInt(cardBlocks['05'].slice(2, 2 + 3)),
            getInt(cardBlocks['05'].slice(5, 5 + 6))), this);
    }
};


allSerials.init = function () {
    for (var i = 0; i < availablePorts.length; i++) {
        Logger.info("Init " + (i + 1) + "serial of Arduino");
        var serial = new SerialPort(availablePorts[i].name, {
            baudRate: 115200
        });

        var serialParser = serial.pipe(new SerialPort.parsers.Readline());

        serialParser.on('open', function () {
            Logger.info("Serial Port has been opened");
        }).on('error', function (err) {
            Logger.error("Serial Port has been failed when it opened", err);
        }).on('data', function (data) {
            for (var i = 0; i < allSerials.length; i++) {
                if (allSerials[i].serialParser === this) {
                    Parser.parse(data, allSerials[i].arduinoID); // second is arduino id
                }
            }
        });

        //allSerials[i] = new Arduino(i, serial, serialParser);

        var obj = new Arduino();
        obj.setValues(i, serial, serialParser);
        allSerials[i] = obj;
    }

    Parser.on('cardFound', function (cardData, arduinoID) {
        Logger.info("arduinoID = ", arduinoID)
        allSerials[arduinoID].processCard(cardData, arduinoID);
    });

    Parser.on('writeStatus', function (status, arduinoID) {
        allSerials[arduinoID].emit('writeStatus', status, arduinoID);
    });

    Logger.info("Parser listener has been set");
}

module.exports = allSerials;
