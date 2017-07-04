var redis  = require('./redis');
var _      = require('lodash');
var logger = require('./logger');

function zerify(str){
    return ('00' + str).slice(-2);
}

function round(num, div){
    return Math.floor(num / div) * div;
}

var get = function (key, callback) {
  var t = new Date();
  redis.get(key, function (err, data) {
    if (err) {
      return callback(err);
    }
    if (!data) {
      return callback();
    }
    data = JSON.parse(data);
    var duration = (new Date() - t);
    logger.debug('Cache', 'get', key, (duration + 'ms').green);
    callback(null, data);
  });
};

exports.get = get;

// time 参数可选，秒为单位
var set = function (key, value, time, callback) {
  var t = new Date();

  if (typeof time === 'function') {
    callback = time;
    time = null;
  }
  callback = callback || _.noop;
  value = JSON.stringify(value);

  if (!time) {
    redis.set(key, value, callback);
  } else {
    redis.setex(key, time, value, callback);
  }
  var duration = (new Date() - t);
  logger.debug("Cache", "set", key, (duration + 'ms').green);
};

exports.set = set;

// userInfo: {user_id:'', device: '', login_time:''}
var setOnline = function(userInfo, prefix, time, callback){

    if (typeof time === 'function') {
        callback = time;
        time = null;
    }

    if (!callback){
        callback = time;
        time = null;
        prefix = prefix || 'online';
    }

    // userInfo = JSON.stringify(userInfo);
    var key = this.getTimeKey(prefix);

    redis.sadd(key, userInfo, callback);
    if (time) {
        redis.expire(key, time, callback);
    }

};

exports.setOnline = setOnline;

var getOnline = function(prefix, time, callback){

    if (typeof time === 'function') {
        callback = time;
        time = 180;
    }

    if (typeof prefix === 'function') {
        callback = prefix;
        prefix = 'online';
        time = 180;
    }

    var keys = this.getTimeKeys(time, prefix);
    redis.sunion(keys, callback);
};

exports.getOnline = getOnline;

function getTimeKey (prefix){
    prefix = prefix || this.options.prefix;
    var date = new Date();
    var hh = zerify(date.getHours());
    var mm = zerify(date.getMinutes());
    var ss = zerify(round(date.getSeconds(), 5));
    return prefix + ':' +  hh + ':' + mm + ':' + ss;
};

exports.getTimeKey = getTimeKey;

var getTimeKeys = function(time, prefix){
    var timestamp = Date.now(), hh, mm, ss, keys= [];
    var rnd = 5;

    for(var i = 0; i < Math.ceil(time / rnd); i++){
        var date = new Date(timestamp - i * rnd * 1000);

        hh = zerify(date.getHours());
        mm = zerify(date.getMinutes());
        ss = zerify(round(date.getSeconds(), rnd));

        keys.push(prefix + ':' + hh + ':' + mm + ':' + ss);

    }

    return keys;
};

exports.getTimeKeys = getTimeKeys;
