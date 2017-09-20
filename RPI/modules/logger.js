'use strict';

const winston = require('winston');
const dateTime = require('node-datetime');

module.exports = function(_module) {

	let filename = _module.filename.match(/[^/]+\.js$/);
	let allLogsFilename = dateTime.create().format('Ymd');

	let transports = [
		new winston.transports.Console({
			timestamp: true,
			colorize: true,
			level: 'info'
		}),
		new winston.transports.File({
			filename: '../logs/' + filename + '.log',
			level: 'warning'
		}),
		new winston.transports.File({
			filename: '../logs/' + allLogsFilename + '.log',
			level: 'info'
		})
	];

	return new winston.Logger({ transports: transports });
}