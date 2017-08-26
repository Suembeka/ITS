var MySQL = require('mysql');
var Logger = require('logger');

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

    connect: function() {
        DAO.connection = MySQL.createConnection(connectionOptions);
        
        DAO.connection.connect(function(err) {
            if(DAO.logError(err)) {
                isInit = false;
            } else {
                isInit = true;
                
            }
        });
    },

    logError: function(err) {
        if(err) {
            logger.log({
                file: __filename,
                dir: __dirname,
                error: err
            });
            return true;
        } else {
            return false;
        }
    },

    // TODO: move to controller
    db: {},
    init: function() {
        DAO.connect();
        db = connection;
        DAO.getTransportID();
        DAO.getPaymentAmount();
    },

    state: {},
    curStation : 1,
    curStationOrder : 1,

    getTransportID: function() {
        DAO.connection.query('SELECT transport_id FROM transport', function(err, result) {
            if(!DAO.logError(err)) {
                DAO.state.transportID = result.transportID;
            }
        });
    },

    getPaymentAmount: function() {
        DAO.connection.query('SELECT payment_amount FROM misc', function(err, result) {
            if(!DAO.logError(err)) {
                DAO.state.paymentAmount = result.paymentAmount;
            }
        });
    }
};

module.exports = DAO;