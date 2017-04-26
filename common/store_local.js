var config  = require('../config');
var utility = require('utility');
var path    = require('path');
var fs      = require('fs');

exports.upload = function (file, options, callback) {
  var filename = options.filename;

  var newFilename = utility.md5(filename + String((new Date()).getTime())) +
    path.extname(filename);

  var upload_path = config.upload.path;
  var base_url    = config.upload.url;
  var filePath    = path.join(upload_path, newFilename);
  var fileUrl     = base_url + newFilename;

  file.on('end', function () {
    console.log("writeStream end");
  });

  // DONE(hhdem) 上传未结束就读取文件生成hash, 导致报找不到文件错, 原有的file.on('end') 改为 file.pipe().on('close')方式, 真正在写结束后调用回掉函数, 此处需要注意如果不需要上传后对图片做分析可以不用等待直接用原有的方法
  file.pipe(fs.createWriteStream(filePath))
      .on('close', function() {
          console.log("writeStream2 end");
          callback(null, {
              url: fileUrl
          });
      });
};
