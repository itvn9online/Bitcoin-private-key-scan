var fs = require('fs');

module.exports = {
    // tạo thư mục nếu chưa có
    createDir: function (dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            fs.chmodSync(dir, 0777);
        }
    },

    // ghi đè vào file
    myWriteFile: function (f, c) {
        /*
         * f: file save to
         * c: content
         */

        //
        fs.writeFile(f, c, function (err) {
            if (err) throw err;
            console.log('Saved (write)! ' + f);
        });
        //fs.chmodSync(f, 0777);
    },

    // ghi thêm nội dung vào file
    myAppendFile: function (f, c) {
        /*
         * f: file save to
         * c: content
         */

        //
        fs.appendFile(f, c, function (err) {
            if (err) throw err;
            console.log('Saved (append)! ' + f);
        });
        //fs.chmodSync(f, 0777);
    },

    // trả về ngày hiện tại
    currentDate: function () {
        var a = new Date();
        return a.toISOString().split('T')[0];
    },

    // lười viết dấu , ở cuối nên làm cái author cho nó tiện
    authorEmail: 'itvn9online@gmail.com'
};
