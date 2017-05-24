// 一次性脚本
// 为所有老用户生成 accessToken

var uuid = require('node-uuid');
var mongoose = require('mongoose');
var config = require('../config');
var async = require('async');
require('../models/user');

mongoose.connect(config.db + config.dbname, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db + config.dbname, err.message);
    process.exit(1);
  }
});

var UserModel = mongoose.model('User');

var hasRemain = true;
async.whilst(
  function () {
    return hasRemain;
  },
  function (callback) {
    UserModel.findOne({accessToken: {$exists: false}}, function (err, user) {
      if (!user) {
        hasRemain = false;
        callback();
        return;
      }
      user.accessToken = uuid.v4();
      user.save(function () {
        console.log(user.loginname + ' done!');
        callback();
      });
    });
  },
  function (err) {
    mongoose.disconnect();
  });

