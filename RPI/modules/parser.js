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

    parse(data) {
        var block;
        data = data.replace(/[\r\n]/g, '');
        var isTrue = /^\[([0-9]{2})(.{32})]$/.test(data);
        console.log(data, isTrue);

        if(/\[([0-9]{2})(.{32})]/.test(data)) {
            block = data.match(/^\[([0-9]{2})(.{32})]$/);
            cardBlocks[block[1]] = block[2];
        } else if(/\[E\]/.test(data)) {
            this.emit('cardFound', cardBlocks);
            cardBlocks = {};
        } else if(/\[STATUS\|OK\]/.test(data)) {
            this.emit('writeStatus', true);
        } else if(/\[STATUS\|FAIL\]/.test(data)) {
            this.emit('writeStatus', false);
        }
    }
	
	encode(blocks) {
        var msg = '[S]\n';
        for(var blockNum in blocks) {
            msg += '[' + blockNum + blocks[blockNum] + ']\n';
        }
        msg += '[E]\n';
        return msg;
	}
};

Parser = new Parser();

module.exports = Parser;