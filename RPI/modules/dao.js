'use strict';

function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}

var MySQL = require('mysql');
var Logger = require('./logger')(module);
const uuidv1 = require('uuid/v1');

var DAO = {
    connection: null,

    connectionOptions: {
        host: 'localhost',
        port: '/var/run/mysqld/mysqld.sock',
        user: 'rpibus',
        password: '12345678qwerty',
        database: 'its_rpi'
    },

    connect: function () {
        return new Promise((resolve, reject) => {
            DAO.connection = MySQL.createConnection(DAO.connectionOptions);

            DAO.connection.connect(function (err) {
				if(err) {
                    Logger.error("DB connect failed");
                    Logger.error(err);
                    reject();
				} else {
                    Logger.info("DB connect successful");
                    resolve();
				}
            });
        });
    },

    logError: function (err) {
        if (err) {
            Logger.error(err);
            return true;
        } else {
            return false;
        }
    },

    // TODO: move to controller
    init: function () {
        return DAO.connect()
		.then(() => DAO.getTransportID())
		.then(() => DAO.getPaymentAmount())
		.then(() => DAO.getRouteID())
        .then(() => DAO.GPS.allStations())
        .then(() => Logger.info("Init DB successful"));
    },

    state: {},

    getTransportID: function () {
        return new Promise((resolve, reject) => {
            DAO.connection.query('SELECT id FROM transports', function (err, result) {
                if (!DAO.logError(err)) {
                    DAO.state.transportID = result[0].id;
                    resolve(DAO.state.transportID);
                }
                else {
                    reject();
                }
            });
        });
    },

    getTransactions: function() {
        return new Promise((resolve, reject) => {
            DAO.connection.query('SELECT * FROM transactions WHERE id=(SELECT last_sync_id FROM misc) ORDER BY id LIMIT 10', function (err, result) {
                if (!DAO.logError(err)) {
                    resolve(result);
                } else {
                    reject();
                }
            });
        });
    },

    saveLastSyncID: function(lastSyncID) {
        return new Promise((resolve, reject) => {
            DAO.connection.query('UPDATE misc SET last_sync_id="'+lastSyncID+'"', function (err, result) {
                if (!DAO.logError(err)) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
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

    checkCircle: function (card_id) {
        Logger.info("Checking circle...");
        return new Promise(function (resolve, reject) {
            DAO.connection.query('SELECT circle_number FROM transactions WHERE card_id = ' + card_id + ';', function (err, result) {
                if (!DAO.logError(err)) {
                    if (result.length !== 0) {
                        if (result[0].circle_number !== DAO.GPS.circlesCount) {
                            return resolve();
                        } else {
                            return reject("Уже оплачено!!!...");
                        }
                    } else {
                        return resolve();
                    }
                }
            });
        });
    },

    startTransaction: function (cardID, cardType) {
        var pay;
        if (cardType === 0) {
            pay = DAO.state.paymentAmount;
        } else {
            pay = 0;
        }

        return new Promise(function (resolve, reject) {
			DAO.connection.query('START TRANSACTION;', function(err, result) {
                if(err) {
                    Logger.error(err);
                    return;
                }

                DAO.connection.query("INSERT INTO `transactions` (`transaction_id`,`transport_id`, `route_id`, `station_id`, `card_id`, `card_type`,   `payment_amount`, `circle_number`) VALUES ('" + uuidv1() + "', '" + DAO.state.transportID + "', '" + DAO.state.routeID + "', '" + DAO.GPS.curStation + "', '" + cardID + "', '" + cardType + "', '" + pay + "', (SELECT circles_count FROM misc));", function(err, result) {
                    if(err) {
                        Logger.error(err);
                        reject();
                        return;
                    }

                    DAO.connection.query('SELECT time FROM transactions WHERE card_id = ' + cardID + ' ORDER BY id DESC LIMIT 1;', function (err, result2) {
                        if (!DAO.logError(err)) {
                            return resolve(result2[0].time);
                        } else {
                            return reject("Запись не найдена!!!");
                        }
                    });
                });
            });

			/*
            DAO.connection.query('SELECT circles_count FROM misc;', function (err, result) {
                if (!DAO.logError(err)) {
                    DAO.connection.query("START TRANSACTION;", function (err, res) {
                        DAO.connection.query("INSERT INTO `transactions` (`transaction_id`,`transport_id`, `route_id`, `station_id`, `card_id`, `card_type`, `payment_amount`, `circle_number`) VALUES ('" + uuidv1() + "', '" + DAO.state.transportID + "', '" + DAO.state.routeID + "', '" + DAO.GPS.curStation + "', '" + cardID + "', '" + cardType + "', '" + pay + "', '" + result[0].circles_count + "');",
                            function (err, result1) {
                                if (!DAO.logError(err)) {
                                    Logger.info("Start transaction...");

                                    DAO.connection.query('SELECT time FROM transactions WHERE card_id = ' + cardID + ' ORDER BY id DESC LIMIT 1;', function (err, result2) {
                                        if (!DAO.logError(err)) {
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
            */
        });
    },

    commitTransaction: function () {
        DAO.connection.query('COMMIT;', function (err, result) {
            if (!DAO.logError(err)) {
                Logger.info("Commited!!");
            }
        });
    },

    rollbackTransaction: function () {
        DAO.connection.query('ROLLBACK;', function (err, result) {
            if (!DAO.logError(err)) {
                Logger.info("Rollbacked!!");
            }
        });
    },

    GPS: {
        curStation: 1,
        curStationOrder: 1,
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
            Logger.info("Changing current station...");
            DAO.connection.query('UPDATE misc SET current_station_id = ' + DAO.GPS.curStation + ';', function (err) {
                if (!DAO.logError(err)) {
                    Logger.info('Current station has changed...');
                }
            });
        },

        increaseCircle: function () {
            DAO.connection.query('UPDATE misc SET circles_count = ' + DAO.GPS.circlesCount + ';', function (err) {
                if (!DAO.logError(err)) {
                    Logger.info('Circles have increased...');
                }
            });
        }
    }
};

module.exports = DAO;
