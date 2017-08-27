var logger_file = require('./logger.js');
var radius = 3;
var dist, latlng;

var methods = {
    processGPS: function (GPS, data, dbModule) {
        "use strict";
        if (!dbModule.isInit) {
            console.log('dbModule.isInit = ' + dbModule.isInit);
            return;
        }

        if (!data.lat || !data.lon) {
            console.log('!data.lat || !data.lont = true ' + Date.now());
            return;
        }

        dbModule.GPS.stationsLatLng.filter(function (station) {
            latlng = station.latlng.split(',');
            dist = GPS.Distance(latlng[0], latlng[1], data.lat, data.lon) * 1000;
            console.log("Текущая станция = " + dbModule.GPS.curStationOrder);
            if (dist <= radius) {
                if (station.station_by_order > dbModule.curStationOrder) {
                    dbModule.GPS.curStationOrder = station.station_by_order;
                    dbModule.GPS.curStation = station.id;
                    dbModule.GPS.setCurrentStation();
                }
            } else if ((station.station_by_order === 1) && (dbModule.GPS.curStationOrder !== 1)) {
                dbModule.GPS.circlesCount++;
                dbModule.GPS.increaseCircle();
            }
        });
    }
};


module.exports = methods;
