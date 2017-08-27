'use strict';

var EventEmitter = require('events');

var Parser = {};

class ArduinoParser extends EventEmitter {
    tokens = {
        commandStart: '[',
        commandEnd: ']',
        commandSequenceStart: '[S]',
        commandSequenceEnd: '[E]',
        commandWrite: '[W(PIN{2})(DATA{16})]',
        responseRead: '[(PIN{2})(DATA{16})]',
        responseStatusOK: '[STATUS|OK]',
        responseStatusFail: '[STATUS|FAIL]'
    }

    processData = function(data) {
        
    }
};

Parser.arduino = new ArduinoParser();


modules.exports = Parser;