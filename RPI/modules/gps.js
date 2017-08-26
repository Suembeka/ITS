/*var GPS = require('gps');*/

/*parser.on('data', console.log);*/
/*port.write('ROBOT PLEASE RESPOND\n');*/

var methods = {
    processGPS: function (data, dbModule) {
        console.log('dbModule.isInit = ' + dbModule.isInit);
        if (!dbModule.isInit) {
            //console.log('isInit = false');
            return;
        }

        /*var data = gps.state;*/
        console.log(data);
        if (!data.lat || !data.lon) {
            return;
        }

        console.log(data.lat, data.lon);

        /*dbModule.db.query('SELECT * FROM routes_stations;', function (err, result) {
			if (err) {
				logger.writeLog('db.txt', err);
			}
		
			result.filter(function (station) {
				var latlng = station.latlng.split(',');
			    	var dist = GPS.Distance(latlng[0], latlng[1], data.lat, data.lon) * 1000;

			    	if (dist <= radius) {
			        	if (station.stationOrder === (dbModule.state.curStationOrder + 1)) {
			            		cur_station_id = dbModule.state.curStationOrder + 1;

			            		dbModule.query("UPDATE misc SET station_id = " + station.id + ";", function (err) {
			                		if (err) {
								logger.writeLog('db.txt', err);
							}
			                		logger.writeLog('db.txt', 'Current station has changed');
			            		});
			        	}
			    	}
			});
    		});*/
    }
};


module.exports = methods;
