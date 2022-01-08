module.exports = {
    // mỗi khi update code thì cần biết code trên vps đã được update rồi hay chưa
    version: '1.0.2',
    
    //
    debugCode: false, // true || false ---> LIVE
    //debugCode: true, // TEST

    // URL để xác định IP hiện tại đang chạy tool
    //requestIP: 'https://ipecho.net/plain',
    requestIP: 'https://cloud.echbay.com/scan/btc/getipaddress',

    // URL thông báo đã tìm thấy ví có số dư
    // mặc định về cơ bản thì khi scan được địa chỉ ví, thông tin này sẽ được gửi cho cả người viết code này, nên để an toàn, nếu bạn là người sử dụng code này thì nên xóa đoạn code sau đây đi rồi mới sử dụng
    requestBalance: 'https://cloud.echbay.com/scan/btc/hasbalance', // gửi email cho admin
    //requestBalance: '', // không gửi email cho admin

    // URL lưu log việc scan -> dùng để thống kê là chủ yếu
    requestLog: 'https://cloud.echbay.com/scan/btc/log',

    // địa chỉ ví dùng để test số dư
    testWallet: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',

    // thư mục lưu trữ các kết quả trả về hoặc log
    dirWritable: '/writable',

    // số vòng lặp để scan địa chỉ ví
    //maxWhile: 1000 * 1000,
    maxWhile: 100 * 1000, // do giờ có thể tái khởi động bot tự động lên không cần đặt số cao
    // số lượng địa chỉ ví mỗi lần scan -> tùy vào maximum của mỗi API mà điều chỉnh cho hợp lý
    maxAdds: 100,

    // giãn cách giữa mỗi lần scan (tính theo giây)
    spaceScan: 5.5,

    // thiết lập thời gian tối đa cho mỗi request -> quá lâu thường là request lỗi
    requestTimeout: 33,

    //
    //userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    userAgent: 'request',

    // URL dùng để check số dư ví -> KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI
    addressAPI: 'https://blockchain.info/multiaddr?limit=0&cors=true&active=',
    // dấu ngăn cách giữa các địa chỉ ví
    addressComma: '|',

    // lười viết dấu , ở cuối nên làm cái author cho nó tiện
    author: 'daidq'
};


/*
* text color:
Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"
*/
//console.log('\x1b[36m%s\x1b[33m', 'I am cyan'); // cyan
//console.log('Text in red'.red);
//console.log('Text in yellow'.yellow);
//console.log("\t\t\t\t\t" + 'Text in yellow');
