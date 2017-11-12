'use strict';

const Request = require('request');

class Net {
    constructor() {
        //this.apiURL = 'http://its.loc/';
        this.apiURL = 'http://192.168.43.232:8088/ITS/sync';
    }

    sendRequest(jsonPackage) {
        return new Promise((resolve, reject) => {
            Request({
                method: 'POST',
                uri: this.apiURL,
                json: jsonPackage,
                //timeout: 50000,
                headers: {
					'Connection': 'keep-alive'
				}
            }, (err, response, body) => {
                if(err) { reject(err); } // Error message
                if (response.statusCode == 200) {
                    resolve(body);
                }
            });
        });
    }

    // TODO: check internet connection procedure
    checkConnection() {
        return true;
    }
};

const net = new Net();

module.exports = net;
