// Files
var logger_file = require('./modules/logger.js');
var gps_file = require('./modules/gps.js');
var dao_file = require('./modules/dao.js');
var net_controller_file = require('./modules/net_controller.js');
var notifier_file = require('./modules/notifier.js');
var parser_file = require('./modules/parser.js');
var usb_controller_file = require('./modules/usb_controller.js');

dao_file.init();

var SerialPort = require('serialport');

var Readline = SerialPort.parsers.Readline;

var parser = new Readline();

/*parser.on('open', function(){
	console.log('onOpen');

});*/


var GPS = require('gps');
var gps = new GPS();

var portGPS = new SerialPort('/dev/ttyS0');
portGPS.pipe(parser);

var UUID = 0;

var count = 1;
//var lonSum = 0;
//var latSum = 0;
//var buffer = [];



parser.on('data', function (data) {
    "use strict";
    gps.update(data);
}).on('error', function (err) {
    "use strict";
    logger_file.writeLog(err);
});
/*gps.on('data', function () {
	console.log('parsed');
});*/


setInterval(function () {
    "use strict";
    gps_file.processGPS(GPS, gps.state, dao_file);
}, 1000);
