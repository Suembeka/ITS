'use strict';

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
        if (err) {
            Logger.log({
                file: __filename,
                err: err
            });
            return true;
        } else {
            return false;
        }
    },

    // TODO: move to controller
    db: {},
    init: function () {
        DAO.connect();
        DAO.db = DAO.connection;
        DAO.getTransportID();
        DAO.getPaymentAmount();
        DAO.GPS.allStations();
        console.log("Init() successful");
    },

    state: {},

    getTransportID: function () {
        DAO.connection.query('SELECT id FROM transports', function (err, result) {
            if (!DAO.logError(err)) {
                DAO.state.transportID = result[0].id;
            }
        });
    },

    getPaymentAmount: function () {
        DAO.connection.query('SELECT payment_amount FROM routes', function (err, result) {
            if (!DAO.logError(err)) {
                DAO.state.paymentAmount = result[0].payment_amount;
            }
        });
    },

    GPS: {
        curStation: 0,
        curStationOrder: 0,
        circlesCount: 0,
        stationsLatLng: null,
        checkedStations: [],

        allStations: function () {
            DAO.connection.query('SELECT stations.id, latlng, station_by_order FROM stations, routes_stations WHERE stations.id = routes_stations.station_id;', function (err, result) {
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
