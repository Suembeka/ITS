'use strict';

var EventEmitter = require('events');

var cardBlocks = {};

class Parser extends EventEmitter {
    // '\[S\]',
    // '\[E\]',
    // '\[W([0-9]{2})(.{16})\]',
    // '\[([0-9]{2})(.{16})\]',
    // '\[STATUS|OK\]',
    // '\[STATUS|FAIL\]'

    parse(data, arduinoID) {
        var block;

        data = data.replace(/[\r\n]/g, '');

        if (/\[([0-9]{2})(.{32})]/.test(data)) {
            block = data.match(/^\[([0-9]{2})(.{32})]$/);
            cardBlocks[block[1]] = block[2];
        } else if (/\[E\]/.test(data)) {
            this.emit('cardFound', cardBlocks, arduinoID);
            cardBlocks = {};
        } else if (/\[STATUS\|OK\]/.test(data)) {
            this.emit('writeStatus', true, arduinoID);
        } else if (/\[STATUS\|FAIL\]/.test(data)) {
            this.emit('writeStatus', false, arduinoID);
        }
    }

    encode(blocks) {
        var newLine = '\r\n';
        var msg = '[S]' + newLine;
        for (var blockNum in blocks) {
            msg += '[W' + blockNum + blocks[blockNum] + ']' + newLine;
        }
        msg += '[E]' + newLine;
        return msg;
    }
};

Parser = new Parser();

module.exports = Parser;
