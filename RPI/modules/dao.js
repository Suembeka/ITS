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
        database: 'bus_system'
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
            Logger.log({file: __filename, err: err});
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
    },

    state: {},
    curStation: 1,
    curStationOrder: 1,
    circlesCount: 0,

    getTransportID: function () {
        DAO.connection.query('SELECT transport_id FROM transport', function (err, result) {
            if (!DAO.logError(err)) {
                DAO.state.transportID = result.transportID;
            }
        });
    },

    getPaymentAmount: function () {
        DAO.connection.query('SELECT payment_amount FROM misc', function (err, result) {
            if (!DAO.logError(err)) {
                DAO.state.paymentAmount = result.paymentAmount;
            }
        });
    }
};

module.exports = DAO;