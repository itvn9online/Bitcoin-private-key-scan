'use strict';

var request = require('request');

//
//svip=$(wget http://ipecho.net/plain -O - -q ; echo)
request.get({
    url: 'http://ipecho.net/plain',
    json: true,
    timeout: 30 * 1000,
    headers: {
        'User-Agent': 'request'
        //'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
    }
}, (err, res, data) => {
    if (err) {
        console.log('Error:', err);
        console.log(data);
    } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
        console.log(data);
    } else {
        console.log(data);
    }
});
