var EventProxy = require('eventproxy');
var models = require('../models');
var Forum = models.Forum;
var User = require('./user');
var Topic = require('./topic');
var _ = require('lodash');
var config       = require('../config');
var tools = require('../common/tools');


/**
 * 根据ID获取板块信息
 * Callback:
 * - err, 数据库错误
 * - forum, 画板
 * - creator, 创建者
 * @param {String} id Forum ID
 * @param {Function} callback 回调函数
 */
exports.getForumById = function (id, callback) {
    var proxy = new EventProxy();
    var events = ['forum', 'creator', 'topics'];
    proxy.assign(events, function (forum, creator, topics) {
        if (!creator) {
            return callback(null, null, null, null);
        }
        return callback(null, forum, creator, topics);
    }).fail(callback);

    Forum.findOne({_id: id}, proxy.done(function (forum) {
        if (!forum) {
            proxy.emit('forum', null);
            proxy.emit('creator', null);
            proxy.emit('topics', null);
            return;
        }
        proxy.emit('forum', forum);

        User.getUserById(forum.user, proxy.done('creator'));

        if (forum.topic_count) {
            var options = { limit: config.list_topic_count};
            var query = { forum: id };
            Topic.getTopicsByQuery(query, options, proxy.done(function (topics) {
                proxy.emit('topics', topics);
            }));
        } else {
            proxy.emit('topics', null);
        }
    }));
};

/**
 * 获取关键词能搜索到的主题数量
 * Callback:
 * - err, 数据库错误
 * - count, 主题数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
    Forum.count(query, callback);
};

/**
 * 根据关键词，获取画板 (Forum) 列表
 * Callback:
 * - err, 数据库错误
 * - count, Forum 列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getForumsByQuery = function (query, opt, callback) {
    Forum.find(query, {}, opt).lean()
        .populate('user')
        .populate('managers', '_id loginname')
        .populate('members', '_id loginname')
        .populate('parent')
        .exec(function (err, forums) {
        if (err) {
            return callback(err);
        }
        if (forums.length === 0) {
            return callback(null, []);
        }
        _.forEach(forums, function (forum) {
            forum.create_at_ago = tools.formatDate(forum.create_at, true);
            forum.update_at_ago = tools.formatDate(forum.update_at, true);
        });

        forums = _.compact(forums); // 删除不合规的 topic
        return callback(null, forums);

    });
};

/**
 * 获取所有板块的主题
 * Callback:
 * - err, 数据库异常
 * - message, 消息
 * - topic, 主题
 * - author, 主题作者
 * - replies, 主题的回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getFullForum = function (id, callback) {
    var proxy = new EventProxy();
    var events = ['forum', 'topics', 'childrens', 'others'];
    proxy
        .assign(events, function (forum, topics, childrens, others) {
            callback(null, '', forum, topics, childrens, others);
        })
        .fail(callback);

    Forum.findOne({_id: id})
        .populate('user')
        .populate('managers', '_id loginname')
        .populate('members', '_id loginname')
        .populate('parent')
        .exec(proxy.done(function (forumModal) {
        if (!forumModal) {
            proxy.unbind();
            return callback(null, '此板块不存在或已被删除。');
        }
        let forum = forumModal.toObject();
        forum.create_at_ago = tools.formatDate(forum.create_at, true);
        forum.update_at_ago = tools.formatDate(forum.update_at, true);
        proxy.emit('forum', forum);

        let query = {
            forum: id
        };
        let options = {sort: 'create_at'};
        Topic.getTopicsByQuery(query, options, proxy.done('topics'));

        Forum.find({parent: id}, {}, {}).lean()
            .populate('user')
            .populate('managers', '_id loginname')
            .populate('members', '_id loginname')
            .populate('parent')
            .exec(function (err, forums) {
                proxy.emit('childrens', forums);
            });

        Forum.find({parent: forum.parent, _id: {'$nin': [id]}}, {}, {}).lean()
            .populate('user')
            .populate('managers', '_id loginname')
            .populate('members', '_id loginname')
            .populate('parent')
            .exec(function (err, forums) {
                proxy.emit('others', forums);
            });
    }));
};


/**
 * 根据Forum ID，查找
 * @param {String} id Forum ID
 * @param {Function} callback 回调函数
 */
exports.getForum = function (id, callback) {
    Forum.findOne({_id: id}, callback);
};

/**
 * 将当前 Forum 的主题计数减 1
 * @param {String} id Forum ID
 * @param {Function} callback 回调函数
 */
exports.reduceTopicCount = function (id, callback) {
    Forum.findOne({_id: id}, function (err, forum) {
        if (err) {
            return callback(err);
        }

        if (!forum) {
            return callback(new Error('该Forum不存在'));
        }
        forum.topic_count -= 1;
        forum.save(callback);
    });
};

exports.newAndSave = function (forumObj, callback) {
    var forum = new Forum(forumObj);
    forum.save(callback);
};
