var os = require('os');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var EventProxy = require('eventproxy');
var Forum        = require('../proxy').Forum;
var User        = require('../proxy').User;

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
        var render = function (users) {
            res.render('dashboard/index', {
                reply_count: 0,
                active_user_count: 0,
                users: users,
                topics: [],
                images: [],
                boards: [],
                teams: [],
                forums: [],
                system: system
            });
        };
        var ep = EventProxy.create();
        ep.fail(next);
        ep.assign('users', render);
        User.getUsersByQuery({}, {}, ep.done('users'));

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
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, sort: '-create_at', limit: limit};
    User.getCountByQuery({}, function (err, all_topics_count) {
        if (err) {
            return next(err);
        }
        var pages = Math.ceil(all_topics_count / limit);
        User.getUsersByQuery({}, options, function (err, users) {
            if (err) {
                return next(err);
            }
            res.render('dashboard/users', {
                current_page: page,
                pages: pages,
                users: users
            });
        });
    });

};

// TODO 管理员地区管理界面
exports.areas = function (req, res, next) {

};

// DONE (hhdem) 所有Forum列表
exports.forums = function (req, res, next) {
    var options = { sort: '-order', limit: 10};
    Forum.getForumsByQuery({}, options, function (err, forums) {
        if (err) {
            return next(err);
        }
        res.render('dashboard/forums', {
            forums: forums
        });
    });
};