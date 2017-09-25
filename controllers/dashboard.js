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
var store = require('../common/store');
var logger = require('../common/logger');


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
        var render = function (users, active_users, forums, boards, topics, images, nodes) {
            res.render('dashboard/index', {
                reply_count: 0,
                active_user_count: active_users.length,
                users: users,
                topics: topics,
                images: images,
                boards: boards,
                teams: [],
                forums: forums,
                system: system,
                nodes: nodes
            });
        };
        var ep = EventProxy.create();
        ep.fail(next);
        ep.assign('users', 'active_users', 'forums', 'boards', 'topics', 'images', 'nodes', render);
        User.getUsersByQuery({}, {}, ep.done('users'));
        User.getUsersByQuery({active: true}, {}, ep.done('active_users'));
        Forum.getForumsByQuery({}, {}, ep.done('forums'));
        Node.getNodesByQuery({}, {}, ep.done('nodes'));
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
    var query = {parent: null};
    if (!!req.query.pid) {
        query.parent = req.query.pid;
    }
    Node.getCountByQuery(query, function (err, all_nodes_count) {
        if (err) {
            return next(err);
        }
        var pages = Math.ceil(all_nodes_count / limit);
        Node.getNodesByQuery(query, options, function (err, nodes) {
            if (err) {
                return next(err);
            }
            let parent = null;
            if (!!query.parent && nodes.length > 0) {
                parent = nodes[0].parent;
            }
            res.render('dashboard/nodes', {
                current_page: page,
                pages: pages,
                nodes: nodes,
                parent: parent
            });
        });
    });
};

// DONE (hhdem) 所有Forum列表
exports.forums = function (req, res, next) {
    var options = { sort: '-order', limit: 10};
    var query = {parent: null};
    if (!!req.query.pid) {
        query.parent = req.query.pid;
    }
    Forum.getForumsByQuery(query, options, function (err, forums) {
        if (err) {
            return next(err);
        }
        let parent = null;
        if (!!query.parent && forums.length > 0) {
            parent = forums[0].parent;
        }
        res.render('dashboard/forums', {
            forums: forums,
            parent: parent
        });
    });
};

exports.forumShow = function (req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: {
                options: [true],
                errorMessage: '板块名称不能为空'
            },
            isMongoId: {errorMessage: 'id 需为 mongoId 对象'}
        }
    });
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            return res.status(400).json({
                success: false,
                err_message: '参数验证失败',
                err: result.useFirstErrorOnly().mapped()
            }).end();
        }
        var id = req.params.id;
        Forum.getFullForum(id, function (err, msg, forum, topics) {
            if (!!err) {
                return next (err);
            }
            if (!forum) {
                res.status(404);
                return res.send({success: false, error_msg: '板块不存在'});
            }
            if (!!msg) {
                res.status(404);
                return res.send({success: false, error_msg: msg});
            }
            forum.topics = topics;
            res.send({success: true, data: forum});
        });
    });
};

exports.deleteAllImages = function (req, res, next) {

    Topic.getTopicsByQuery({type: 'image', deleted: true}, {}, function (err, topics) {
        if (!!err) {
            return next (err);
        }
        // test for qn
        // store.delete('FpUrRAkfWrcB79T2oQgm94LJAGW9', function(err){
        //     if (err) {
        //         logger.error(err);
        //     }
        // });
        _.forEach(topics, function (topic) {
            store.delete(topic.image, function(){});
            // TODO 删除图片时，删除Model对象
            topic.remove();
        });
        res.send({success: true, count: topics.length});
    });
};