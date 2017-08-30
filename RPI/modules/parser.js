'use strict';

var EventEmitter = require('events');

var cardBlocks = {};

class Parser extends EventEmitter {
    getTokens() {
        return {
            commandSequenceStart: '\[S\]',
            commandSequenceEnd: '\[E\]',
            commandWrite: '\[W([0-9]{2})(.{16})\]',
            responseRead: '\[([0-9]{2})(.{16})\]',
            responseStatusOK: '\[STATUS|OK\]',
            responseStatusFail: '\[STATUS|FAIL\]'
        }
    }

    parse(data) {
        var block;
        data = data.replace(/[\r\n]/g, '');
        var isTrue = /^\[([0-9]{2})(.{32})]$/.test(data);
        console.log(data, isTrue);

        if(/\[([0-9]{2})(.{32})]/.test(data)) {
            block = data.match(/^\[([0-9]{2})(.{32})]$/);
            cardBlocks[block[1]] = block[2].split(/(.{2})/).filter(function(el){ return el.length > 0; });
        } else if(/\[E\]/.test(data)) {
            this.emit('cardFound', cardBlocks);
            cardBlocks = {};
        }
        
    }
	
	writeToCard(blocks) {
		console.log(blocks);
	}
};

Parser = new Parser();

module.exports = Parser;