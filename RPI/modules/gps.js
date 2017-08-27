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
            return;
        }

        dbModule.db.query('SELECT latlng, station_by_order FROM stations, route_stations WHERE stations.id = route_stations.station_id;', function (err, result) {
            if (err) {
                logger_file.writeLog(err);
            }

            result.filter(function (station) {
                latlng = station.latlng.split(',');
                dist = GPS.Distance(latlng[0], latlng[1], data.lat, data.lon) * 1000;
                console.log("Текущая станция = " + dbModule.curStationOrder);
                if (dist <= radius) {
                    if (station.station_by_order > dbModule.curStationOrder) {
                        dbModule.curStationOrder = station.station_by_order;
                        dbModule.curStation = station.id;

                        dbModule.db.query("UPDATE misc SET current_station_id = " + dbModule.curStation + ";", function (err) {
                            if (err) {
                                logger_file.writeLog(err);
                            }
                        });
                    }
                } else if (station.station_by_order === 1) {
                    (dbModule.circlesCount)++;
                    dbModule.db.query('UPDATE misc SET circles_count = ' + dbModule.circles_count + ';', function (err) {
                        if (err) {
                            logger_file.writeLog(err);
                        }
                    });
                }
            });
        });
    }
};


module.exports = methods;
