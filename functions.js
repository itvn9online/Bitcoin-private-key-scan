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

    countScan: function (d, c) {
        /*
         * d: dir
         * c: content
         */
        var count_path = d + '/' + this.currentDate();
        this.createDir(count_path);
        count_path += '/count.txt';
        //console.log(count_path);
        //return true;

        // có nội dung thì lưu nội dung
        if (typeof c == 'number' && c != '') {
            this.myWriteFile(count_path, c.toString());
            return true;
        }

        // không có thì kiểm tra và lấy dữ liệu trả về
        if (fs.existsSync(count_path)) {
            var a = fs.readFileSync(count_path).toString();
            a *= 1;
            //console.log('Count scan (log): ', a);

            //
            return a;
        }

        //
        return 0;
    },

    // trả về ngày hiện tại
    currentDate: function () {
        var a = new Date();
        return a.toISOString().split('T')[0];
    },

    // lười viết dấu , ở cuối nên làm cái author cho nó tiện
    authorEmail: 'itvn9online@gmail.com'
};
