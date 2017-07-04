var bcrypt = require('bcryptjs');
var moment = require('moment');
var ua = require('mobile-agent');
var util = require('util');

moment.locale('zh-cn'); // 使用中文

// 格式化时间
exports.formatDate = function (date, friendly) {
    date = moment(date);

    if (friendly) {
        return date.fromNow();
    } else {
        return date.format('YYYY-MM-DD HH:mm');
    }

};

exports.validateId = function (str) {
    return (/^[a-zA-Z0-9\-_]+$/i).test(str);
};

exports.bhash = function (str, callback) {
    bcrypt.hash(str, 10, callback);
};

exports.bcompare = function (str, hash, callback) {
    bcrypt.compare(str, hash, callback);
};

exports.hexToBinary = function (s) {
    const lookup = {
        '0': '0000',
        '1': '0001',
        '2': '0010',
        '3': '0011',
        '4': '0100',
        '5': '0101',
        '6': '0110',
        '7': '0111',
        '8': '1000',
        '9': '1001',
        'a': '1010',
        'b': '1011',
        'c': '1100',
        'd': '1101',
        'e': '1110',
        'f': '1111',
        'A': '1010',
        'B': '1011',
        'C': '1100',
        'D': '1101',
        'E': '1110',
        'F': '1111'
    };
    let ret = '';
    for (let i = 0; i < s.length; i++) {
        ret += lookup[s[i]];
    }
    return ret;
};

/**
 * @param req
 * @returns {device:'pc', os:'Ios', brower:'chrome (v1356.34)'}
 */
exports.client_info = function (req) {
    let agent = ua(req.headers['user-agent']);
    let deviceInfo = {};
    if (agent.iPhone) {
        deviceInfo.device = 'iPhone';
    } else if (agent.iPad) {
        deviceInfo.device = 'iPad';
    } else if (agent.Mac) {
        deviceInfo.device = 'Mac';
    } else if (agent.Other) {
        deviceInfo.device = 'Other';
    }
    if (agent.Android) {
        deviceInfo.os = 'Android';
    } else if (agent.iOS) {
        deviceInfo.os = 'IOS';
    } else if (agent.webOS) {
        deviceInfo.os = 'webOS';
    } else if (agent.Windows) {
        deviceInfo.os = 'Windows';
    }
    deviceInfo.brower = agent.Browser.name + ' (v' + agent.Browser.version + ')';
    deviceInfo.mobile = agent.Mobile;
    return deviceInfo;
};