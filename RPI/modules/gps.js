'use strict';

const logger_file = require('./logger.js');
const SerialPort = require('serialport');
const GPSReader = require('gps');

const Serial = new SerialPort('/dev/ttyS0', { baudRate: 115200 });
const SerialParser =  Serial.pipe(new SerialPort.parsers.Readline());
const gpsReader = new GPS;
const GPSState = gpsReader.state;

SerialParser.on('data', function (data) {
    gpsReader.update(data);
}).on('error', function (err) {
    logger_file.writeLog(err);
});

var radius = 3;

var GPS = {
    processGPS: function (dbModule) {
        "use strict";
        var dist, latlng, dist1, latlng1;
        if (!dbModule.isInit) {
            console.log('dbModule.isInit = ' + dbModule.isInit);
            return;
        }

        if (!GPSState.lat || !GPSState.lon) {
            console.log('!GPSState.lat || !GPSState.lont = true ' + Date.now());
            return;
        }

        console.log("Текущая станция = " + dbModule.GPS.curStationOrder);

        var min, min_id, min_order, f = true,
            j;
        for (var i = 0; i < dbModule.GPS.stationsLatLng.length; i++) {
            j = i + 1;
            if (i === (dbModule.GPS.stationsLatLng.length - 1)) {
                j = 0;
            }
            latlng = dbModule.GPS.stationsLatLng[i].latlng.split(',');
            dist = GPSReader.Distance(latlng[0], latlng[1], GPSState.lat, GPSState.lon) * 1000;
            latlng1 = dbModule.GPS.stationsLatLng[j].latlng.split(',');
            dist1 = GPSReader.Distance(latlng1[0], latlng1[1], GPSState.lat, GPSState.lon) * 1000;
            if (f) {
                min = dist + dist1;
                if (dist < dist1) {
                    min_id = dbModule.GPS.stationsLatLng[i].id;
                    min_order = dbModule.GPS.stationsLatLng[i].station_by_order;
                } else {
                    min_id = dbModule.GPS.stationsLatLng[j].id
                    min_order = dbModule.GPS.stationsLatLng[j].station_by_order;
                }
                f = false;
            } else if ((dist + dist1) < min) {
                min = dist + dist1;
                if (dist < dist1) {
                    min_id = dbModule.GPS.stationsLatLng[i].id;
                    min_order = dbModule.GPS.stationsLatLng[i].station_by_order;
                } else {
                    min_id = dbModule.GPS.stationsLatLng[j].id
                    min_order = dbModule.GPS.stationsLatLng[j].station_by_order;
                }
            }
        }

      if(dbModule.GPS.curStation !== min_id) { 
        if ((min_id === 1) &&
              (dbModule.GPS.curStationOrder > 1)) {
              this.newCircle(dbModule, min_id);
          } else {
              dbModule.GPS.curStationOrder = min_order;
              dbModule.GPS.curStation = min_id;
              dbModule.GPS.setCurrentStation();
          }
        }
    },

    newCircle: function (dbModule, id) {
        "use strict";
        dbModule.GPS.circlesCount++;
        dbModule.GPS.increaseCircle();
        dbModule.GPS.curStationOrder = 1;
        dbModule.GPS.curStation = id;
        dbModule.GPS.setCurrentStation();
    }
};

module.exports = methods;