var MySQL = require('mysql');
var Logger = require('./logger');

var DAO = {
    connection: null,

    isInit: false,

    connectionOptions: {
        host: 'localhost',
        port: '/var/run/mysqld/mysqld.sock',
        user: 'rpibus',
        password: '12345678qwerty',
        database: 'its_rpi'
    },

    connect: function () {
        "use strict";
        DAO.connection = MySQL.createConnection(DAO.connectionOptions);

        DAO.connection.connect(function (err) {
            if (DAO.logError(err)) {
                DAO.isInit = false;
            } else {
                DAO.isInit = true;
            }
        });
    },

    logError: function (err) {
        "use strict";
        if (err) {
            /*Logger.log({
                file: __filename,
                dir: __dirname,
                error: err
            });*/
            return true;
        } else {
            return false;
        }
    },

    // TODO: move to controller
    db: {},
    init: function (GPSInc) {
        "use strict";
        DAO.connect();
        DAO.db = DAO.connection;
        DAO.getTransportID();
        DAO.getPaymentAmount();
        DAO.GPS.allStations();
        console.log("Init() successful");
    },

    state: {},

    getTransportID: function () {
        "use strict";
        DAO.connection.query('SELECT transport_id FROM transport', function (err, result) {
            if (!DAO.logError(err)) {
                DAO.state.transportID = result.transportID;
            }
        });
    },

    getPaymentAmount: function () {
        "use strict";
        DAO.connection.query('SELECT payment_amount FROM misc', function (err, result) {
            if (!DAO.logError(err)) {
                DAO.state.paymentAmount = result.paymentAmount;
            }
        });
    },

    GPS: {
        curStation: 0,
        curStationOrder: 0,
        circlesCount: 0,
        stationsLatLng: null,
        distances: [],

        allStations: function () {
            DAO.connection.query('SELECT latlng, station_by_order FROM stations, route_stations WHERE stations.id = route_stations.station_id;', function (err, result) {
                if (!DAO.logError(err)) {
                    DAO.GPS.stationsLatLng = result;
                }
            });
        },

        setCurrentStation: function () {
            DAO.connection.query('UPDATE misc SET current_station_id = ' + DAO.GPS.curStation + ';', function (err) {
                if (!DAO.logError(err)) {
                    Logger.writeLog('Current station has changed...');
                }
            });
        },

        increaseCircle: function () {
            DAO.connection.query('UPDATE misc SET circles_count = ' + DAO.GPS.circlesCount + ';', function (err) {
                if (!DAO.logError(err)) {
                    Logger.writeLog('Circles have increased...');
                }
            });
        }
    }
};

module.exports = DAO;
