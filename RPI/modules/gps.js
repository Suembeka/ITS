'use strict';

const Logger = require('./logger.js')(module);
const SerialPort = require('serialport');
const GPSReader = require('gps');

const Serial = new SerialPort('/dev/ttyS0', {
    baudRate: 9600
});
const SerialParser = Serial.pipe(new SerialPort.parsers.Readline());
var gpsReader = new GPSReader();
var GPSState = gpsReader.state;

SerialParser.on('data', function (data) {
    gpsReader.update(data);
}).on('error', function (err) {
    Logger.error(err);
});

var GPS = {
    processGPS: function (dbModule) {
        Logger.debug("processGps has called");
        var distance = [],
            latlng = [],
            j, initVal = true,
            min = {
                sum: 0,
                id: null,
                order: null
            };

        if (!GPSState.lat || !GPSState.lon) {
            Logger.debug('!GPSState.lat || !GPSState.lont = true ' + Date.now());
            return;
        }

        for (var i = 0; i < dbModule.GPS.stationsLatLng.length; i++) {
            j = i + 1;

            if (i === (dbModule.GPS.stationsLatLng.length - 1)) {
                j = 0;
            }

            latlng[0] = dbModule.GPS.stationsLatLng[i].latlng.split(',');
            distance[0] = GPSReader.Distance(latlng[0][0], latlng[0][1], GPSState.lat, GPSState.lon) * 1000;
            latlng[1] = dbModule.GPS.stationsLatLng[j].latlng.split(',');
            distance[1] = GPSReader.Distance(latlng[1][0], latlng[1][1], GPSState.lat, GPSState.lon) * 1000;

            if (initVal) {
                min.sum = distance[0] + distance[1];

                if (dbModule.GPS.stationsLatLng[i].station_by_order < dbModule.GPS.stationsLatLng[j].station_by_order) {
                    min.id = dbModule.GPS.stationsLatLng[i].id;
                    min.order = dbModule.GPS.stationsLatLng[i].station_by_order;
                } else {
                    min.id = dbModule.GPS.stationsLatLng[j].id
                    min.order = dbModule.GPS.stationsLatLng[j].station_by_order;
                }

                initVal = false;
            } else if ((distance[0] + distance[1]) < min.sum) {
                min.sum = distance[0] + distance[1];
                if (dbModule.GPS.stationsLatLng[i].station_by_order < dbModule.GPS.stationsLatLng[j].station_by_order) {
                    min.id = dbModule.GPS.stationsLatLng[i].id;
                    min.order = dbModule.GPS.stationsLatLng[i].station_by_order;
                } else {
                    min.id = dbModule.GPS.stationsLatLng[j].id
                    min.order = dbModule.GPS.stationsLatLng[j].station_by_order;
                }
            }
        }

        if (dbModule.GPS.curStation !== min.id) {
            Logger.info("Текущая станция = " + dbModule.GPS.curStationOrder);
            if (min.order < dbModule.GPS.curStationOrder) {
                this.newCircle(dbModule, min.id);
            } else {
                dbModule.GPS.curStationOrder = min.order;
                dbModule.GPS.curStation = min.id;
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

module.exports = GPS;
