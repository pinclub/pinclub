var config = require('../config');
var utility = require('utility');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var rotator = require('auto-rotate');
const resizeImg = require('resize-img');

var imageTypes = [".jpg",".png",".gif",".bmp",".jpeg"];

/**
 *
 * @param file
 * @param options:
 * {
 *  filename:
 *  userId:
 *  filesize: []
 *  autoFix: true
 * }
 * @param callback
 */
exports.upload = function (file, options, callback) {
    let filename = options.filename;
    let fileext = path.extname(filename);
    let isImage = false;
    let user_path = '';
    if (!!options.userId) {
        user_path = _.toString(options.userId) + '/';
    }
    if (_.indexOf(imageTypes, _.toLower(fileext)) >= 0) {
        isImage = true;
    }

    let upload_path = config.upload.path + user_path;
    let base_url = config.upload.url + user_path;
    // 如果文件夹不存在则创建
    if (!fs.existsSync(upload_path)) {
        fs.mkdirSync(upload_path);
    }

    let mdfilename = utility.md5(filename + String((new Date()).getTime()));
    var newFilename = mdfilename + fileext;
    var resizeFixedFilename = mdfilename + '_fixed' + fileext;


    var filePath = path.join(upload_path, newFilename);
    var fileFixedPath = path.join(upload_path, resizeFixedFilename);
    var fileUrl = base_url + newFilename;

    file.on('end', function () {
        console.log("writeStream end");
    });

    // DONE(hhdem) 上传未结束就读取文件生成hash, 导致报找不到文件错, 原有的file.on('end') 改为 file.pipe().on('close')方式, 真正在写结束后调用回掉函数, 此处需要注意如果不需要上传后对图片做分析可以不用等待直接用原有的方法
    file.pipe(fs.createWriteStream(filePath))
        .on('close', function () {
            if (!!isImage && (_.toLower(fileext) === '.jpg' || _.toLower(fileext) === '.jpeg')) {
                rotator.autoRotateFile(filePath, fileFixedPath)
                    .then(function (rotated) {
                        console.log(rotated ? filePath + ' rotated to ' + fileFixedPath : filePath + ' no rotation was needed');
                        if (rotated) {filePath = fileFixedPath;}
                        // DONE (hhdem) 上传图片时裁剪生成 86 像素宽的缩略图, 存储到upload下
                        _.forEach(options.filesize, function (fileResize) {
                            let resizeFilename = mdfilename + '_' + fileResize + fileext;
                            resizeImg(fs.readFileSync(filePath), {width: fileResize}).then(buf => {
                                fs.writeFileSync(path.join(upload_path, resizeFilename), buf);
                            });
                        });

                        callback(null, {
                            url: fileUrl,
                            rotated: true
                        });
                    }).catch(function (err) {
                        console.error('Got error: ' + err);
                    });
            } else if (!!isImage) {

                _.forEach(options.filesize, function (fileResize) {
                    let resizeFilename = mdfilename + '_' + fileResize + fileext;
                    resizeImg(fs.readFileSync(filePath), {width: fileResize}).then(buf => {
                        fs.writeFileSync(resizeFilename, buf);
                    });
                });
                callback(null, {
                    url: fileUrl,
                    rotated: false
                });
            } else {
                callback(null, {
                    url: fileUrl,
                    rotated: false
                });
            }
        });
};
