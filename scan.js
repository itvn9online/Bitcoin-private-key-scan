/*
cd ~
cd F:\AppServ\www\nodejs\Bitcoin
node scan
*/
var http = require("http");
var CoinKey = require('coinkey');
//var getJSON = require('get-json')
var fs = require('fs');
var request = require('request');


/*
 * config
 */
var debug_code = true; // true || false
if (debug_code === true) {
    console.log('You are in debug mode!');
}

//
if (debug_code === false) {
    // số vòng lặp để scan địa chỉ ví
    var max_while = 100 * 1000;
    // số lượng địa chỉ ví mỗi lần scan
    var max_adds = 100;
} else {
    var max_while = 2; // TEST
    var max_adds = 3; // TEST
}

//
var total_scan = 0;


// tạo các thư mục lưu trữ nếu chưa có
function create_dir_if_not_exist(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        fs.chmodSync(dir, 0777);
    }
}

// tạo thư mục lưu trữ
var dir_writable = './writable';
create_dir_if_not_exist(dir_writable);

// thư mục log
var dir_log = dir_writable + '/logs';
create_dir_if_not_exist(dir_log);

// log theo ngày
let current_date = new Date();
current_date = current_date.toISOString().split('T')[0];
console.log('Current date: ' + current_date);

//
//console.log('userAgent: ' + navigator.userAgent);

//
var dir_date_log = dir_log + '/' + current_date;
create_dir_if_not_exist(dir_date_log);


//
var str_adds = '';
var arr_adds = [];
var arr_key_adds = [];
var urlBase = '';

// thêm dữ liệu vào mảng để còn request
function push_tmp_data(data) {
    arr_adds.push(data.add);
    arr_key_adds.push(data);
}

function random_btc_address(max_i) {
    if (typeof max_i != 'number') {
        max_i = max_adds;
    } else if (max_i <= 0) {
        return false;
    }

    //
    var wallet = new CoinKey.createRandom();
    //console.log('Key: ', wallet.privateKey.toString('hex'));
    //console.log('Add: ', wallet.publicAddress);

    //
    var pri = wallet.privateKey.toString('hex');

    //
    str_adds += 'Key: ' + pri + ' Add: ' + wallet.publicAddress + "\n";

    //
    push_tmp_data({
        'key': pri,
        'add': wallet.publicAddress,
    });

    //
    random_btc_address(max_i - 1);
}

function MY_writeFile(f, c) {
    /*
     * f: file save to
     * c: content
     */

    //
    fs.writeFile(f, c, function (err) {
        if (err) throw err;
        console.log('Saved! ' + f);
    });
}

function MY_appendFile(f, c) {
    /*
     * f: file save to
     * c: content
     */

    //
    fs.appendFile(f, c, function (err) {
        if (err) throw err;
        console.log('Saved! ' + f);
    });
}

function action_btc_address() {
    str_adds = '';
    arr_adds = [];
    arr_key_adds = [];

    //
    random_btc_address();

    //
    urlBase = 'https://blockchain.info/multiaddr?limit=0&cors=true&active=' + arr_adds.join('|');
}

// tạo kết nối tới server
/*
http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    //response.end('Hello World');
    response.end(str);
}).listen(8081);
*/

//
//console.log('Server running at http://127.0.0.1:8081/');
//console.log(str);
//console.log(arr_adds);

//
/*
http.get(urlBase, function (res) {
    console.log(res);
}).on('error', function (e) {
    console.log("Got an error: ", e);
});
*/

//
//'use strict';
var auto_next_scan = true;
var timeout_scan = null;

function MY_scan(max_i) {
    auto_next_scan = false;

    //
    var url = urlBase;
    //console.log(url);
    var current_time = new Date();
    console.log(current_time.toISOString().split('.')[0].replace('T', ' '));

    //
    request.get({
        url: url,
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
            // data is already parsed as JSON:
            //console.log(data);

            //
            if (typeof data.addresses != 'undefined') {
                total_scan += data.addresses.length;

                // chạy vòng lặp kiểm tra số dư
                var has_balance = false;
                for (var i = 0; i < data.addresses.length; i++) {
                    var pri = '';
                    for (var y = 0; y < arr_key_adds.length; y++) {
                        if (arr_key_adds[y].add == data.addresses[i].address) {
                            pri = arr_key_adds[y].key;
                            break;
                        }
                    }

                    //
                    console.log(data.addresses[i].final_balance + ' ' + pri + ' ' + data.addresses[i].address);

                    // nếu có số dư thì lưu lại file
                    if (data.addresses[i].final_balance > 0) {
                        MY_writeFile(dir_writable + '/' + data.addresses[i].address + '.txt', JSON.stringify(arr_key_adds));
                        has_balance = true;
                    }
                }

                //
                console.log('Total scan: ' + total_scan);
                console.log('While: ' + max_i);

                // lưu log để thi thoảng còn check
                if (max_i % 100 == 0) {
                    MY_appendFile(dir_date_log + '/list.txt', str_adds);
                }

                //
                if (has_balance === false) {
                    auto_next_scan = true;
                }
            }
        }

        //
        clearTimeout(timeout_scan);
        timeout_scan = setTimeout(function () {
            while_scan(max_i - 1);
        }, 5000);
    });

    //
    return true;
}

//
function test_scan(max_i) {
    if (debug_code === true && max_i === 1) {
        //console.log('TEST');
        // TEST
        push_tmp_data({
            'key': 'no-private-key',
            'add': '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
        });
        urlBase += '|34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo';
        //console.log(arr_adds);
    }
}

function while_scan(max_i) {
    if (typeof max_i != 'number') {
        max_i = max_while;
    } else if (max_i <= 0) {
        console.log('STOP because max while zero!');
        return false;
    } else if (auto_next_scan !== true) {
        console.log('Auto next scan has been STOP!');
        return false;
    }

    // tạo địa chỉ ví ngẫu nhiên
    action_btc_address();

    //
    test_scan(max_i);

    // scan
    MY_scan(max_i);
}
while_scan();
