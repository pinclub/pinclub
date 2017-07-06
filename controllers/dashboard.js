var os = require('os');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var EventProxy = require('eventproxy');
var Forum        = require('../proxy').Forum;
var Board        = require('../proxy').Board;
var User        = require('../proxy').User;
var Node        = require('../proxy').Node;
var Topic = require('../proxy').Topic;


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
        var render = function (users, active_users, forums, boards, topics, images) {
            res.render('dashboard/index', {
                reply_count: 0,
                active_user_count: active_users.length,
                users: users,
                topics: topics,
                images: images,
                boards: boards,
                teams: [],
                forums: forums,
                system: system
            });
        };
        var ep = EventProxy.create();
        ep.fail(next);
        ep.assign('users', 'active_users', 'forums', 'boards', 'topics', 'images', render);
        User.getUsersByQuery({}, {}, ep.done('users'));
        User.getUsersByQuery({active: true}, {}, ep.done('active_users'));
        Forum.getForumsByQuery({}, {}, ep.done('forums'));
        Board.getBoardsByQuery({}, {}, ep.done('boards'));
        Topic.getTopicsByQuery({type: 'text'}, {}, ep.done('topics'));
        Topic.getTopicsByQuery({type: 'image'}, {}, ep.done('images'));
    });
};

// TODO 管理员维护界面 tag 列表
exports.tags = function (req, res, next) {

};

// TODO 管理员维护界面 board 列表
exports.boards = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, sort: '-create_at', limit: limit};
    Board.getCountByQuery({}, function (err, all_boards_count) {
        if (err) {
            return next(err);
        }
        var pages = Math.ceil(all_boards_count / limit);
        Board.getBoardsByQuery({}, options, function (err, boards) {
            if (err) {
                return next(err);
            }
            res.render('dashboard/boards', {
                current_page: page,
                pages: pages,
                boards: boards
            });
        });
    });
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

// TODO 管理员节点管理界面
exports.nodes = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, sort: '-create_at', limit: limit};
    Node.getCountByQuery({}, function (err, all_nodes_count) {
        if (err) {
            return next(err);
        }
        var pages = Math.ceil(all_nodes_count / limit);
        Node.getNodesByQuery({}, options, function (err, nodes) {
            if (err) {
                return next(err);
            }
            res.render('dashboard/nodes', {
                current_page: page,
                pages: pages,
                nodes: nodes
            });
        });
    });
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