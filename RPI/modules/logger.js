var fileSystem = require('fs');

var dateTime = require('node-datetime');
var dt = dateTime.create();
var file_name = dt.format('Y-m-d');
var formatted = dt.format('Y-m-d H:M:S');

var methods = {
    writeLog: function (text) {
        fileSystem.open(__dirname + "/logs/" + file_name, 'r', function (err, fd) {
            if (err) {
                fileSystem.writeFile(__dirname + "/logs/" + file_name, formatted + " : " + text + "\n", function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            } else {
                fileSystem.appendFile(__dirname + "/logs/" + file_name, formatted + " : " + text + "\n", function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }
        })
    }
}

module.exports = methods;
