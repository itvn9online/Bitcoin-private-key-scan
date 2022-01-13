/*
*
* Lệnh chạy trên window
*
* Lệnh chạy trên linux
/usr/bin/node /root/njs/b/createServer.js
*
*/

/*
 * nạp thư viện
 */
//'use strict';

//
//var http = require('http');
//var https = require('https');
var http2 = require('http2');
var request = require('request');
// tạo ví BTC
var CoinKey = require('coinkey');
// tạo ví ETH
var ethers = require('ethers');
var crypto = require('crypto');
//
var fs = require('fs');
//var url = require('url');
//var net = require('net');


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
 * function
 */
var myFunctions = require(__dirname + '/functions');


/*
 * nạp config
 */
var myConfig = require(__dirname + '/config');

//
//console.log('Remote IP: ', request.socket.remoteAddress);


// tạo thư mục lưu trữ
var dir_writable = __dirname + myConfig.dirWritable;
console.log(dir_writable);
myFunctions.createDir(dir_writable);

// thư mục log
var dir_log = dir_writable + '/logs';
myFunctions.createDir(dir_log);

// log theo ngày
var current_date = myFunctions.currentDate();
console.log('Current date: ', current_date);

//
var dir_date_log = myFunctions.logWithDate(dir_log, current_date);

//
var total_request = 0;
var request_path = dir_date_log + '/total_request.txt';
if (fs.existsSync(request_path)) {
    total_request = fs.readFileSync(request_path).toString();
    total_request *= 1;
}


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

            // create a server object -> sử dụng http2
            http2.createSecureServer(options, function (request, response) {
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
                var check_date = myFunctions.currentDate();
                if (check_date != current_date) {
                    current_date = check_date;

                    //
                    dir_date_log = myFunctions.logWithDate(dir_log, current_date);

                    //
                    total_request = 0;
                    request_path = dir_date_log + '/total_request.txt';
                    if (fs.existsSync(request_path)) {
                        total_request = fs.readFileSync(request_path).toString();
                        total_request *= 1;
                    }
                }

                //
                total_request++;
                //myFunctions.myWriteFile(request_path, total_request.toString());
                // dùng hàm này để không in log ra
                fs.writeFile(request_path, total_request.toString(), function (err) {
                    if (err) throw err;
                    //console.log('Saved (write)! ' + f);
                });
                console.log('Total request: ', total_request);

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
                for (var i = 0; i < 25; i++) {
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
