var SerialPort = require('serialport');

var Arduino = new SerialPort("COM5", {
    baudrate: 115200,
    parser: SerialPort.parsers.Readline
});

var Card = {
    fulldata: "",
    card_id: 0,
    card_type: "",
    amountOfMoney: 0,
    hash: "",
    writeTransaction(){
        connection.query("INSERT INTO 'transactions' VALUES('transaction_id' = '" + UUID + "', 'transaction_time' = '" + Date.now() + "', 'card_id' = '" + currentCard.card_id + "', 'card_type' = '" + currentCard.card_type + "', 'transport_id' = '" + transportID + "', 'station_id' = '" + cur_station_id + "', 'payment_amount' = '" + payment_amount + "');", function (err) {
            if (err) {
                logger.writeLog('db.txt', err);
            }
        });
    },
    //parseCard(){}
};

Arduino.on('data', function (data) {
    // копить данные и ждать начало и окончание передачи ([S] [E])
    // определять тип сообщения ([данные с карты] [отчет о записи])
    // парсить данные учитывая тип сообщения

    currentCard.fullData += data.toString();
    if (data.toString() === '') {
		var currentCard = new Card();
        currentCard.parseCard();
    }
}).on('open', function () {
    logger.writeLog('arduino.txt', 'Serial Port Opened');
}).on('error', function (err) {
    logger.writeLog('arduino.txt', err);
});


//function releaseBuffer() {
//    while (buffer.length > 0) {
//        arduino.write(arduino.buffer.shift());
//    }
//}
//
//function trustedWrite(msg) {
//    if (arduino) {
//        console.log('Write', msg);
//        arduino.write(msg);
//    } else {
//        console.log('Serial not ready, buffering message: ' + msg);
//        buffer.push(m);
//    }
//}