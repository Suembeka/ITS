var fs = require('fs'),
	dateTime = require('node-datetime');

module.exports = (function (){
	var Logger = {};

	Logger.output = 'file';
	Logger.options = {
		logsFolderPath: 'logs/'
	};

	Logger.log = function({file, msg, err}) {
		var time = dateTime.create(),
			currentTime = time.format('d/m/Y H:M:S'),
			fileName = time.format('Ymd') + '.log',
			text = [
				'['+currentTime+']',
				'['+file+']',
				msg,
				(err ? ('\n'+ JSON.stringify(err)) : '')
			].join(' ') + '\n';

		if(Logger.output == 'file') {
			fs.appendFile(Logger.options.logsFolderPath + fileName, text, function(err) {
				if(err) { console.log(err); }
			});
		} else {
			console.log(text);
		}
	};

	// TODO: make it special
	Logger.error = function() {
		Logger.log.apply(Logger, [].slice.call(arguments));
	};
	// TODO: make it special
	Logger.info = function() {
		Logger.log.apply(Logger, [].slice.call(arguments));
	};
	// TODO: make it special
	Logger.debug = function() {
		Logger.log.apply(Logger, [].slice.call(arguments));
	};

	// Legacy
	Logger.writeLog = function(text) {
		console.log(text);
	};

	return Logger;
})();