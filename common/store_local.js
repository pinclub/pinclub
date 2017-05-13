var config = require('../config');
var utility = require('utility');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
const resizeImg = require('resize-img');

exports.upload = function (file, options, callback) {
    var filename = options.filename;
    var fileext = path.extname(filename);
    let user_path = '';
    if (!!options.userId) {
        user_path = _.toString(options.userId) + '/';
    }

    var newFilename = utility.md5(filename + String((new Date()).getTime())) + fileext;
    var resize86Filename = utility.md5(filename + String((new Date()).getTime())) + '_86' + fileext;
    var resize430Filename = utility.md5(filename + String((new Date()).getTime())) + '_430' + fileext;

    var upload_path = config.upload.path + user_path;
    var base_url = config.upload.url + user_path;
    // 如果文件夹不存在则创建
    if (!fs.existsSync(upload_path)) {
        fs.mkdirSync(upload_path);
    }
    var filePath = path.join(upload_path, newFilename);
    var file86Path = path.join(upload_path, resize86Filename);
    var file430Path = path.join(upload_path, resize430Filename);
    var fileUrl = base_url + newFilename;

    file.on('end', function () {
        console.log("writeStream end");
    });

    // DONE(hhdem) 上传未结束就读取文件生成hash, 导致报找不到文件错, 原有的file.on('end') 改为 file.pipe().on('close')方式, 真正在写结束后调用回掉函数, 此处需要注意如果不需要上传后对图片做分析可以不用等待直接用原有的方法
    file.pipe(fs.createWriteStream(filePath))
        .on('close', function () {
            // DONE (hhdem) 上传图片时裁剪生成 86 像素宽的缩略图, 存储到upload下
            resizeImg(fs.readFileSync(filePath), {width: 86}).then(buf => {
                fs.writeFileSync(file86Path, buf);
            });

            resizeImg(fs.readFileSync(filePath), {width: 430}).then(buf => {
                fs.writeFileSync(file430Path, buf);
            });

            callback(null, {
                url: fileUrl
            });
        });
};
