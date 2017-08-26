var mysql = require('mysql');
var logger_file = require('./logger.js');


var gpsObj = {
    db: {},
    isInit: false,
    state: {
        transportID: 0,
        paymentAmount: 0
    },
    init: function () {
        db = mysql.createConnection({
            host: 'localhost',
            port: '/var/run/mysqld/mysqld.sock',
            user: 'rpibus',
            password: '12345678qwerty',
            database: 'bus_system'
        });
        console.log('Connection to db created');

        db.connect(function (err) {
            if (err) {
                logger_file.writeLog(err);
            }
            gpsObj.isInit = true;

            db.query('SELECT transports.id, route_types.payment_amount FROM transports, route_types, transport_routes, routes WHERE (transports.id = transport_routes.transport_id) AND (transport_routes.routes_id = `routes`.`int`) AND (routes.type_id = route_types.id);', function (err, rows) {
                if (err) {
                    logger_file.writeLog(err);
                }
                gpsObj.state.transportID = rows[0].id;
                gpsObj.state.paymentAmount = rows[0].payment_amount;
                //console.log(gpsObj.state);

            });
        });
        return db;
    },
    curStation: 1,
    curStationOrder: 1
};

module.exports = gpsObj;
