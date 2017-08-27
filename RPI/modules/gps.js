'use strict';

const SerialPort = require('serialport');
const Serial = new SerialPort('/dev/tty.usbserial', {
  baudrate: 4800,
  parser: SerialPort.parsers.readline('\r\n')
});
 
const GPSReader = require('gps');
const gpsReader = new GPS;
 
gpsReader.on('data', function(data) {
	console.log(data, gpsReader.state);
});

Serial.on('data', function(data) {
	gpsReader.update(data);
});

const GPS = {};

module.exports = GPS;