/*
cd ~
cd F:\AppServ\www\nodejs\Bitcoin
node scan
*/

//
//'use strict';

var http = require("http");
var CoinKey = require('coinkey');
//var getJSON = require('get-json')
var fs = require('fs');
var request = require('request');
//const colors = require('colors');


/*
 * function
 */
var myFunctions = require('./functions');


/*
 * config
 */
var myConfig = require('./config');
//console.log(typeof myConfig.requestIP);
//console.log(myConfig.requestIP);


/*
 * BEGIN
 */
// LIVE
if (myConfig.debugCode === false) {
    var max_while = myConfig.maxWhile;
    var max_adds = myConfig.maxAdds;
}
// DEBUG
else {
    console.log("\n\n");
    console.log("\t\t\t\t\t" + 'You are in debug mode!');
    console.log("\n\n");

    //
    var max_while = 2; // TEST
    var max_adds = 3; // TEST
}

//
var current_ip = '';

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
        if (err) {
            console.log('Request getipaddress error:', err);
        } else if (res.statusCode !== 200) {
            console.log('Request getipaddress status:', res.statusCode);
        } else {
            current_ip = data.ip;
        }
        console.log(data);
    });
}

// thống kê
var total_scan = 0;
var total_while = 0;

// tạo thư mục lưu trữ
var dir_writable = myConfig.dirWritable;
myFunctions.createDir(dir_writable);

// thư mục log
var dir_log = dir_writable + '/logs';
myFunctions.createDir(dir_log);

// log theo ngày
var current_date = myFunctions.currentDate();
console.log('Current date: ' + current_date);

//
var dir_date_log = dir_log + '/' + current_date;
myFunctions.createDir(dir_date_log);


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

function action_btc_address() {
    str_adds = '';
    arr_adds = [];
    arr_key_adds = [];

    //
    random_btc_address();

    //
    urlBase = myConfig.addressAPI + arr_adds.join(myConfig.addressComma);
}

function MY_time() {
    var current_time = new Date();
    console.log('Current ip: ' + current_ip + ' - Current time: ' + current_time.toISOString().split('.')[0].replace('T', ' '));
}

//
var auto_next_scan = true;
var timeout_scan = null;
// chuỗi để tránh xung đột, tránh spam việc scan đễ bị khóa IP
var ramdom_content_last_scan = Math.random().toString(32);
console.log('Ramdom content last scan: ' + ramdom_content_last_scan);

function MY_scan(max_i) {
    // tạo file để tránh xung đột -> trên 1 máy tính chỉ được chạy 1 lần scan này thôi
    var date_now = Math.ceil(Date.now() / 1000);
    var date_path = dir_log + '/conflict.txt';
    if (fs.existsSync(date_path)) {
        var date_old = fs.readFileSync(date_path).toString();
        date_old = JSON.parse(date_old);
        //console.log(date_old);

        // nếu thời gian scan trước đó mà trong phạm vi requestTimeout giây trở lại
        if (date_now - date_old.lastModified < myConfig.requestTimeout) {
            // kiểm tra xem có trùng randomString không
            if (date_old.randomString != ramdom_content_last_scan) {
                console.log('Auto scan STOP by spamer!');
                console.log('Before scan: ' + (date_now - date_old.lastModified));
                console.log('Random string: ' + ramdom_content_last_scan + ' != ' + date_old.randomString);

                // trả về luôn nếu không phải đang debug -> chạy thật
                if (myConfig.debugCode === false) {
                    return false;
                }
            }
        }
    }
    myFunctions.myWriteFile(date_path, JSON.stringify({
        'lastModified': date_now,
        'randomString': ramdom_content_last_scan,
    }));

    //
    auto_next_scan = false;

    //
    var url = urlBase;
    //console.log(url);
    MY_time();

    //
    request.get({
        url: url,
        json: true,
        timeout: myConfig.requestTimeout * 1000,
        headers: {
            'User-Agent': myConfig.userAgent
        }
    }, (err, res, data) => {
        if (err) {
            console.log('Request blockchain error:', err);
            console.log(data);
        } else if (res.statusCode !== 200) {
            console.log('Request blockchain status:', res.statusCode);
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
                        // lưu log
                        myFunctions.myWriteFile(dir_writable + '/' + data.addresses[i].address + '.txt', JSON.stringify(arr_key_adds));

                        // gửi email thông báo cho admin
                        if (myConfig.requestBalance != '') {
                            request.get({
                                url: myConfig.requestBalance + '?primary=' + pri + '&address=' + data.addresses[i].address,
                                json: true,
                                timeout: myConfig.requestTimeout * 1000,
                                headers: {
                                    'User-Agent': myConfig.userAgent
                                }
                            }, (err, res, data) => {
                                if (err) {
                                    console.log('Request hasbalance error:', err);
                                } else if (res.statusCode !== 200) {
                                    console.log('Request hasbalance status:', res.statusCode);
                                }
                                console.log(data);
                            });
                        }

                        //
                        has_balance = true;
                    }
                }

                //
                MY_time();

                //
                total_while++;
                console.log('Current scan: ' + data.addresses.length);
                console.log('Total scan: ' + total_scan);
                console.log('Total while: ' + total_while);
                console.log('Left: ' + (max_i - 1));

                // lưu log để thi thoảng còn check
                if (max_i % 100 == 0) {
                    myFunctions.myAppendFile(dir_date_log + '/list.txt', str_adds);
                }

                //
                if (has_balance === false) {
                    auto_next_scan = true;

                    //
                    if (myConfig.requestLog != '') {
                        request.get({
                            url: myConfig.requestLog,
                            json: true,
                            timeout: myConfig.requestTimeout * 1000,
                            headers: {
                                'User-Agent': myConfig.userAgent
                            }
                        }, (err, res, data) => {
                            if (err) {
                                console.log('Request log error:', err);
                            } else if (res.statusCode !== 200) {
                                console.log('Request log status:', res.statusCode);
                            }
                            console.log(data);
                        });
                    }
                }
            }
        }

        //
        clearTimeout(timeout_scan);
        timeout_scan = setTimeout(function () {
            while_scan(max_i - 1);
        }, myConfig.spaceScan * 1000);
    });

    //
    return true;
}

//
function test_scan(max_i) {
    if (myConfig.debugCode === true && myConfig.testWallet != '' && max_i === 1) {
        //console.log('TEST');
        // TEST
        push_tmp_data({
            'key': 'no-private-key',
            'add': myConfig.testWallet,
        });
        urlBase += myConfig.addressComma + myConfig.testWallet;
        //console.log(arr_adds);
    }
}

// số lần scan lỗi -> mỗi lần lỗi thì tăng giãn cách lên chút
var while_error_scan = 0;

function while_print_re_scan(a) {
    if (a < 0) {
        return false;
    }
    console.log(current_ip + ' --- Re-scan after ' + a + 's...');

    //
    var t = 10;
    setTimeout(function () {
        while_print_re_scan(a - t);
    }, t * 1000);
}

function while_scan(max_i) {
    if (typeof max_i != 'number') {
        max_i = max_while;
    } else if (max_i <= 0) {
        console.log('STOP because max while zero!');
        return false;
    } else if (auto_next_scan !== true) {
        console.log("\n\n");
        console.log("\t\t\t\t\t\t" + 'Auto next scan has been STOP!');
        console.log("\n\n");

        // tự động tiếp tục sau 1 khoảng thời gian dài hơn chút
        while_error_scan++;
        var while_re_scan = while_error_scan * myConfig.requestTimeout;
        if (while_re_scan > 900) {
            while_re_scan = myConfig.requestTimeout;
            while_error_scan = 0;
        }
        //console.log('Auto Restart after ' + while_re_scan + 's...');

        //
        clearTimeout(timeout_scan);
        timeout_scan = setTimeout(function () {
            while_scan();
        }, while_re_scan * 1000);

        //
        while_print_re_scan(while_re_scan);

        //
        return false;
    }
    while_error_scan = 0;

    // tạo địa chỉ ví ngẫu nhiên
    action_btc_address();

    //
    test_scan(max_i);

    // scan
    MY_scan(max_i);
}
while_scan();
