'use strict';

function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}

var MySQL = require('mysql');
var Logger = require('./logger');
const uuidv1 = require('uuid/v1');



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
        DAO.getRouteID();
        DAO.GPS.allStations();
        console.log("Init() successful");
    },

    state: {},

    getTransportID: function () {
        /*return Promise.resolve(2); // REMOVE
        return new Promise((resolve, reject) => {*/
        DAO.connection.query('SELECT id FROM transports', function (err, result) {
            if (!DAO.logError(err)) {
                DAO.state.transportID = result[0].id;
                /*resolve(DAO.state.transportID);*/
            }
            /*else {
                               reject();
                           }*/
        });
        /*});*/
    },

    getPaymentAmount: function () {
        DAO.connection.query('SELECT payment_amount FROM routes', function (err, result) {
            if (!DAO.logError(err)) {
                DAO.state.paymentAmount = result[0].payment_amount;
            }
        });
    },

    getRouteID: function () {
        DAO.connection.query('SELECT id FROM routes', function (err, result) {
            if (!DAO.logError(err)) {
                DAO.state.routeID = result[0].id;
            }
        });
    },

    checkCircle: function (card_id, arduino) {
        return new Promise(function (resolve, reject) {
            DAO.connection.query('SELECT circle_number FROM transactions WHERE card_id = ' + card_id + ';', function (err, result) {
                if (!DAO.logError(err)) {
                    if (result.length !== 0) {
                        if (result[0].circle_number !== DAO.GPS.circlesCount) {
                            return resolve(arduino);
                        } else {
                            return reject("Уже оплачено!!!...");
                        }
                    } else {
                        return resolve(arduino);
                    }
                }
            });
        });
    },

    setTransaction: function (cardID, cardType) {
        var pay;
        if (cardType === 0) {
            pay = DAO.state.paymentAmount;
        } else {
            pay = 0;
        }

        return new Promise(function (resolve, reject) {
            DAO.connection.query('SELECT circles_count FROM misc;', function (err, result) {
                if (!DAO.logError(err)) {
                    DAO.connection.query("START TRANSACTION;", function (err, res) {
                        DAO.connection.query("INSERT INTO `transactions` (`transaction_id`,`transport_id`, `route_id`, `station_id`, `card_id`, `card_type`, `payment_amount`, `circle_number`) VALUES ('" + uuidv1() + "', '" + DAO.state.transportID + "', '" + DAO.state.routeID + "', '" + DAO.GPS.curStation + "', '" + cardID + "', '" + cardType + "', '" + pay + "', '" + result[0].circles_count + "');",
                            function (err, result1) {
                                if (!DAO.logError(err)) {
                                    console.log("Start transaction...");

                                    DAO.connection.query('SELECT time FROM transactions WHERE card_id = ' + cardID + ' ORDER BY id DESC LIMIT 1;', function (err, result2) {
                                        if (!DAO.logError(err)) {
                                            console.log("result2[0].time = " + result2[0].time);
                                            return resolve(result2[0].time);
                                        } else {
                                            return reject("Запись не найдена!!!");
                                        }
                                    });
                                } else {
                                    return reject("Транзакция не произведена!!!");
                                }
                            });
                    });
                }
            });
        });
    },

    trCommit: function () {
        DAO.connection.query('COMMIT;', function (err, result) {
            if (!DAO.logError(err)) {
                console.log("Commited!!");
            }
        });
    },

    trRollback: function () {
        DAO.connection.query('ROLLBACK;', function (err, result) {
            if (!DAO.logError(err)) {
                console.log("Rollbacked!!");
            }
        });
    },

    getDataForSync: function () {
        return Promise.resolve([{
            id: 0
        }, {
            id: 1
        }, {
            id: 2
        }]); // REMOVE
        return new Promise((resolve, reject) => {
            DAO.connection.query('SELECT * FROM transactions ORDER BY id', function (err, result) {
                if (!DAO.logError(err)) {
                    resolve(result);
                } else {
                    reject();
                }
            });
        });
    },

    confirmTransactions: function (transactions) {
        return Promise.resolve(); // REMOVE

        let lastSyncID = transactions.sort((a, b) => a - b)[0].id;

        return new Promise((resolve, reject) => {
            DAO.connection.query("UPDATE misc SET `last_sync_id` = '" + lastSyncID + "'", function (err, result) {
                if (!DAO.logError(err)) {
                    resolve();
                } else {
                    reject();
                }
            });
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
