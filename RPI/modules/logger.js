var fileSystem = require('fs');

var dateTime = require('node-datetime');
var dt = dateTime.create();
var folder_name = dt.format('Y-m-d');
var formatted = dt.format('Y-m-d H:M:S');

var methods = {
	writeLog: function (text){
		fileSystem.appendFile(__dirname + "/logs/"+folder_name, formatted + " : " + text + "\n", function(err) {
			if(err) {
				return console.log(err);
			}
		});
	}
}

module.exports = methods;
