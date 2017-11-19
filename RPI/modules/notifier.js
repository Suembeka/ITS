'use strict';

const Arduino = require('./arduino');
var Logger = require('./logger')(module);

var N = {
    encode: function (val) {
        var newLine = '\r\n';
        var msg = '[S]' + newLine;
        msg += '[M' + val + ']' + newLine;
        msg += '[E]' + newLine;
        return msg;
    },

    notify: function (arduino, errorType) {
        var encodedData = this.encode(errorType);
        arduino.serial.write(encodedData, function () {
            Logger.info("Notify error");
        });
    }
};

module.exports = N;
