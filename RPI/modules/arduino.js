var serialport = require('serialport');
var Logger = require('./logger');
var EventEmitter = require('events');


// TODO: add port finder
var Serial1 = new SerialPort("COM5", {
    baudrate: 115200,
    parser: SerialPort.parsers.Readline
});
/*
var Serial2 = new SerialPort("COM5", {
    baudrate: 115200,
    parser: SerialPort.parsers.Readline
});
*/
var CardTemplate = {
    cardID: 0,
    cardType: 0,
    balance: 0,
    expireTime: 0
};

Serial.on('open', function () {
    Logger.log({file: __filename, msg: 'Serial Port Opened'});
}).on('error', function (err) {
    Logger.log({file: __filename, msg: 'Serial Port Open Fail', err: err});
}).on('data', function() {
    // копить данные и ждать начало и окончание передачи ([S] [E])
    // определять тип сообщения ([данные с карты] [отчет о записи])
    // парсить данные учитывая тип сообщения
});

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

module.exports = (function() {
    class Arduino extends EventEmitter {
        write = function(payment) {
            console.log(payment);
            setTimeout(function() {
                arduino.emit('writeStatus', payment, Math.random() > 0.8);
            }, 1000);
        }
    };

    var arduino = new Arduino();

    setInterval(function() {
        arduino.emit('payment', generatePayment());
    }, 2000);

    return arduino;
})();