var logger_file = require('./logger.js');
var radius = 3;

var methods = {
    calculateDistances: function (GPSInc, dbModule) {
        var dist, latlng, latlng1;

        for (var i = 0; i < (dbModule.GPS.stationsLatLng.length - 1); i++) {
            latlng = dbModule.GPS.stationsLatLng[i].latlng.split(',');
            latlng1 = dbModule.GPS.stationsLatLng[i + 1].latlng.split(',');
            dist = GPSInc.Distance(latlng[0], latlng[1], latlng1[0], latlng1[1]) * 1000;
            dbModule.GPS.distances.push(dist);
        }
    },

    processGPS: function (GPS, data, dbModule) {
        "use strict";
        var dist, latlng;
        if (!dbModule.isInit) {
            console.log('dbModule.isInit = ' + dbModule.isInit);
            return;
        }

        if (!data.lat || !data.lon) {
            console.log('!data.lat || !data.lont = true ' + Date.now());
            return;
        }

        console.log("Текущая станция = " + dbModule.GPS.curStationOrder);

        if ((dbModule.GPS.curStation === 0) && (dbModule.GPS.curStationOrder === 0)) {
            console.log("Вы не доехали до отправной точки!");
            firstStationInit(GPS, data, dbModule);
            return;
        }


        dbModule.GPS.stationsLatLng.filter(function (station) {
            latlng = station.latlng.split(',');
            dist = GPS.Distance(latlng[0], latlng[1], data.lat, data.lon) * 1000;

            if (dist <= (radius * 2)) {
                if ((station.station_by_order === 1) &&
                    (dbModule.GPS.curStationOrder > 1)
                ) {
                    newCircle(dbModule, station);
                } else if (station.station_by_order !== dbModule.curStationOrder) {
                    changeNext(GPS, data, dbModule, station);
                }
            } else {

                //если не попадает в радиус остановки
            }
        });
    },

    firstStationInit: function (GPS, data, dbModule) {
        var dist, latlng;
        dbModule.GPS.stationsLatLng.filter(function (station) {
            latlng = station.latlng.split(',');
            dist = GPS.Distance(latlng[0], latlng[1], data.lat, data.lon) * 1000;
            if (dist <= (radius * 2)) {
                dbModule.GPS.curStationOrder = 1;
                dbModule.GPS.curStation = station.id;
                dbModule.GPS.setCurrentStation();
            }
        });
    },

    newCircle: function (dbModule, station) {
        "use strict";
        dbModule.GPS.circlesCount++;
        dbModule.GPS.increaseCircle();
        dbModule.GPS.curStationOrder = 1;
        dbModule.GPS.curStation = station.id;
        dbModule.GPS.setCurrentStation();
    },

    changeNext: function (GPS, data, dbModule, station) {
        "use strict";
        var latlng, dist, latlng1;
        if (dbModule.GPS.curStationOrder === (station.station_by_order - 1)) {
            dbModule.GPS.curStationOrder = station.station_by_order;
            dbModule.GPS.curStation = station.id;
            dbModule.GPS.setCurrentStation();
        } else { //если поймал другую станцию
            console.log("Поймал другую станцию!");
            latlng = station.latlng.split(',');
            dbModule.GPS.stationsLatLng.filter(function (station1) {
                latlng1 = station1.latlng.split(',');
                dist = GPS.Distance(latlng[0], latlng[1], latlng1[0], latlng1[1]) * 1000;

                if (dist <= (radius * 2)) {
                    if ((station.station_by_order !== station1.station_by_order) &&
                        (dbModule.GPS.curStationOrder !== station.station_by_order) &&
                        (dbModule.GPS.curStationOrder !== station1.station_by_order)
                    ) {
                        if (Math.abs(dbModule.GPS.curStationOrder - station.station_by_order) > Math.abs(dbModule.GPS.curStationOrder - station1.station_by_order)) {
                            dbModule.GPS.curStationOrder = station1.station_by_order;
                            dbModule.GPS.curStation = station1.id;
                        } else {
                            dbModule.GPS.curStationOrder = station.station_by_order;
                            dbModule.GPS.curStation = station.id;
                        }
                        dbModule.GPS.setCurrentStation();
                    }
                }
            });
        }
    },


};


module.exports = methods;
