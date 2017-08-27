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
    init: function () {
        "use strict";
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

    stationsListStructure: function (id) {
        "use strict";
        this.num = id;
        this.next = null;
        this.prev = null;
    },

    stationsList: {
        head: null,
        addStation: function (id) {
            "use strict";
            var New_Node = DAO.stationsListStructure(id), q;

            if (DAO.stationsList.head === null) {
                DAO.stationsList.head = New_Node;
            } else {
                q = DAO.stationsList.head;
                while (q !== null) {
                    if (q.next === null) {
                        q.next = New_Node;
                        New_Node.prev = q;
                        New_Node.next = null;
                        break;
                    } else {
                        q = q.next;
                    }
                }
            }
        },
        createStationsList: function () {
            "use strict";
            DAO.connection.query('SELECT * FROM route_stations ORDER BY station_by_order', function (err, rows) {
                if (!DAO.logError(err)) {
                    rows.forEach(function (row) {
                        DAO.stationsList.addStation(row.station_by_order);
                    });
                }
            });
        }
    }
};

module.exports = DAO;
