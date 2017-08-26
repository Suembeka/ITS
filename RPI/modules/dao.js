var mysql = require('mysql');

var dbModule = {
    db: {},
    isInit: false,
    state: {},
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
            if (err){
			logger.writeLog('db.txt', err);
		}
            isInit = true;
	    console.log('Init = true');
            db.query('(SELECT transport_id FROM transport) UNION (SELECT payment_amount FROM misc)', function (err, result) {
                if (err) {
			logger.writeLog('db.txt', err);
		}
		console.log(result.transportID);
		console.log(result.paymentAmount);
		state.transportID = result.transportID;
                state.paymentAmount = result.paymentAmount;
            });
        });
    },
    curStation : 1,
    curStationOrder : 1
};