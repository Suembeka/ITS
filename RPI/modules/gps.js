var logger_file = require('./logger.js');
var radius = 3;

var methods = {
    processGPS: function (data, dbModule) {
        if (!dbModule.isInit) {
            console.log('dbModule.isInit = ' + dbModule.isInit)
            return;
        }

        console.log(data.lat, data.lon);

        if (!data.lat || !data.lon) {
            console.log('!data.lat || !data.lon ---- true');
            return;
        }
        console.log('!data.lat || !data.lon ---- false');

        dbModule.db.query('SELECT * FROM route_stations;', function (err, result) {
            console.log("shduhsduc");
            if (err) {
                logger_file.writeLog(err);
            }


            result.filter(function (station) {
                console.log('station = ' + station);
                var latlng = station.latlng.split(',');
                var dist = GPS.Distance(latlng[0], latlng[1], data.lat, data.lon) * 1000;

                if (dist <= radius) {
                    if (station.stationOrder === (dbModule.state.curStationOrder + 1)) {
                        cur_station_id = dbModule.state.curStationOrder + 1;

                        dbModule.query("UPDATE misc SET station_id = " + station.id + ";", function (err) {
                            if (err) {
                                logger_file.writeLog(err);
                            }
                            //logger_file.writeLog(Current station has changed');
                        });
                    }
                }
            });
        });
    }
};


module.exports = methods;
