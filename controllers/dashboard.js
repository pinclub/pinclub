var os = require('os');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

// TODO 管理员维护界面 Dashboard, 统计数据的获取
exports.dashboard = function (req, res, next) {
    async.parallel({
        mongodb: function (callback) {
            var mongodbAdmin = new mongoose.mongo.Admin(mongoose.connection.db);

            mongodbAdmin.buildInfo(function (err, info) {
                if (err) {
                    err.type = 'database';
                    return callback(err);
                }

                callback(null, _.pick(info, 'version').version);
            });
        }
    }, function (err, results) {
        let system = {
            cpuarch: os.arch(),
            cpus: os.cpus(),
            freemem: os.freemem(),
            hostname: os.hostname(),
            platform: os.platform(),
            loadavg: os.loadavg(),
            release: os.release(),
            totalmem: os.totalmem(),
            uptime: os.uptime(),
            node_version: process.versions.node,
            mongodb_version: results.mongodb
        };
        res.render('dashboard/index', {
            reply_count: 0,
            active_user_count: 0,
            users: [],
            topics: [],
            images: [],
            boards: [],
            teams: [],
            forums: [],
            system: system
        });
    });
};

// TODO 管理员维护界面 tag 列表
exports.tags = function (req, res, next) {

};

// TODO 管理员维护界面 board 列表
exports.boards = function (req, res, next) {

};

// TODO 管理员维护界面 用户 列表
exports.users = function (req, res, next) {

};

// TODO 管理员地区管理界面
exports.areas = function (req, res, next) {

};