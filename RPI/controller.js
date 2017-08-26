// Приклепленные файлы
var logger = require('./modules/logger.js');
var gps = require('./modules/gps.js');
var dao = require('./modules/dao.js');
var net_controller = require('./modules/net_controller.js');
var notifier = require('./modules/notifier.js');
var parser = require('./modules/parser.js');
var usb_controller = require('./modules/usb_controller.js');

var UUID = 0;

var count = 1;
//var lonSum = 0;
//var latSum = 0;
const radius = 3;
//var buffer = [];


/*port.on('close', function () {
    connection.end();
});*/
