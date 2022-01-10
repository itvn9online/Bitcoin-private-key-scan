/*
 * nạp thư viện
 */
//'use strict';

//
//var http = require('http');
var https = require('https');
var request = require('request');
// tạo ví BTC
var CoinKey = require('coinkey');
// tạo ví ETH
var ethers = require('ethers');
var crypto = require('crypto');
//
var fs = require('fs');
//var url = require('url');


/*
 * tạo kết nối qua https
 */
var open_domain = 'analytics.echbot.com';
var open_port = 34567;
var options = {};

// thử với key của echbot
var ssl_key_pem = '/etc/letsencrypt/live/' + open_domain + '/privkey.pem';
var ssl_certificate_pem = '/etc/letsencrypt/live/' + open_domain + '/fullchain.pem';

//
if (fs.existsSync(ssl_key_pem) && fs.existsSync(ssl_certificate_pem)) {
    console.log('With echbot SSL!');

    //
    options = {
        key: fs.readFileSync(ssl_key_pem),
        cert: fs.readFileSync(ssl_certificate_pem)
    };
} else {
    // nếu không có -> dùng tạm key mặc định
    ssl_key_pem = '/usr/local/www/default_server/snakeoil-key.pem';
    ssl_certificate_pem = '/usr/local/www/default_server/snakeoil-certificate.pem';

    //
    if (fs.existsSync(ssl_key_pem) && fs.existsSync(ssl_certificate_pem)) {
        console.log('With default SSL!');

        //
        options = {
            key: fs.readFileSync(ssl_key_pem),
            cert: fs.readFileSync(ssl_certificate_pem)
        };
    } else {
        console.log('SSL key not found!');
    }
}


/*
 * nạp config
 */
var myConfig = require(__dirname + '/config');


//
if (myConfig.requestIP != '') {
    request.get({
        url: myConfig.requestIP,
        json: true,
        timeout: myConfig.requestTimeout * 1000,
        headers: {
            'User-Agent': myConfig.userAgent
        }
    }, (err, res, data) => {
        console.log(data);
        if (err) {
            console.log('Request getipaddress error:', err);
        } else if (res.statusCode !== 200) {
            console.log('Request getipaddress status:', res.statusCode);
        } else {
            // TEST
            //data.ip = '127.0.0.1';

            //
            console.log('Open host:');
            console.log('https://' + data.ip + ':' + open_port);
            console.log('https://' + open_domain + ':' + open_port);

            // create a server object:
            https.createServer(options, function (request, response) {
                /*
                 * setHeader phải chạy đầu tiên, xong thích làm gì thì làm
                 */
                // Website you wish to allow to connect
                response.setHeader('Access-Control-Allow-Origin', '*');

                //
                //const queryObject = url.parse(request.url, true).query;
                //console.log(queryObject);

                //
                response.writeHead(200, {
                    //'Access-Control-Allow-Origin': '*',
                    //'Content-Type': 'text/plain'
                    'Content-Type': 'application/json'
                });

                //
                var result = {
                    'b': [],
                    'e': []
                };

                //
                /*
                if (typeof queryObject.symbol == 'undefined') {
                    queryObject.symbol = '';
                }
                */

                // tạo ngẫu nhiên ví ETH
                for (var i = 0; i < 20; i++) {
                    var id = crypto.randomBytes(32).toString('hex');
                    var pri = "0x" + id;
                    var wallet = new ethers.Wallet(pri);

                    //
                    result.e.push({
                        'k': pri,
                        'a': wallet.address
                    });
                }

                // tạo ngẫu nhiên ví BTC
                for (var i = 0; i < 100; i++) {
                    var wallet = new CoinKey.createRandom();

                    //
                    result.b.push({
                        'k': wallet.privateKey.toString('hex'),
                        'a': wallet.publicAddress
                    });
                }

                //
                //response.end(JSON.stringify(queryObject));
                response.end(JSON.stringify(result));
            }).listen(open_port, data.ip);
        }
    });
}
