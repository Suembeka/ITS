'use strict';

const Request = require('request');

class Net {
    constructor() {
        this.apiURL = 'http://its.loc/';
    }

    sendRequest(jsonPackage) {
        return new Promise((resolve, reject) => {
            Request({
                method: 'POST',
                uri: this.apiURL,
                form: jsonPackage,
                timeout: 5000,
                headers: {},
                json: true
            }, (err, response, body) => {
                if(err) { reject(); } // Error message
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
