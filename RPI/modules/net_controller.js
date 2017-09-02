'use strict';

const Request = require('request');

class Net {
    constructor() {
        this.apiURL = '';
    }

    sendRequest(jsonPackage) {
        return new Promise((resolve, reject) => {
            request({
                method: 'POST'
                uri: this.apiURL,
                form: jsonPackage,
                timeout: 5000,
                headers: {},
                json: true
            }, (err, response, body) => {
                if(err) { reject(); } // Error message
                resolve(body);
            });
        });
    }
};

const net = new Net();

module.exports = net;
