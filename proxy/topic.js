var EventProxy = require('eventproxy');
var models = require('../models');
var Topic = models.Topic;
var Board = require('./board');
var User = require('./user');
var Reply = require('./reply');
var tools = require('../common/tools');
var at = require('../common/at');
var _ = require('lodash');
var structureHelper = require('../common/structure_helper');

/**
 * 根据主题ID获取主题
 * Callback:
 * - err, 数据库错误
 * - topic, 主题
 * - author, 作者
 * - lastReply, 最后回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getTopicById = function (id, callback) {
    var proxy = new EventProxy();
    var events = ['topic', 'author', 'last_reply'];
    proxy.assign(events, function (topic, author, last_reply) {
        if (!author) {
            return callback(null, null, null, null);
        }
        return callback(null, topic, author, last_reply);
    }).fail(callback);

    Topic.findOne({_id: id}, proxy.done(function (topic) {
        if (!topic) {
            proxy.emit('topic', null);
            proxy.emit('author', null);
            proxy.emit('last_reply', null);
            return;
        }
        proxy.emit('topic', topic);

        User.getUserById(topic.author, proxy.done('author'));

        if (topic.last_reply) {
            Reply.getReplyById(topic.last_reply, proxy.done(function (last_reply) {
                proxy.emit('last_reply', last_reply);
            }));
        } else {
            proxy.emit('last_reply', null);
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
    Topic.count(query, callback);
};

/**
 * 根据关键词，获取主题列表
 * Callback:
 * - err, 数据库错误
 * - count, 主题列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getTopicsByQuery = function (query, opt, callback) {
    // query.deleted = false;
    Topic.find(query, {}, opt)
        .populate('board')
        .populate('forum')
        .populate('author')
        .deepPopulate('last_reply last_reply.author')
        .exec(function (err, topics) {
        if (err) {
            return callback(err);
        }
        if (topics.length === 0) {
            return callback(null, []);
        }

        // var proxy = new EventProxy();
        // proxy.after(JSON.stringify(query)+'topic_ready', topics.length, function () {
            topics = _.compact(topics); // 删除不合规的 topic
            return callback(null, topics);
        // });
        // proxy.fail(callback);
        //
        // topics.forEach(function (topic, i) {
        //     var ep = new EventProxy();
        //     ep.all('reply' + i, function (reply) {
        //         // 保证顺序
        //         // 作者可能已被删除
        //         if (reply) {
        //             topic.reply = reply;
        //         } else {
        //             topics[i] = null;
        //         }
        //         proxy.emit(JSON.stringify(query) + 'topic_ready');
        //     });
        //     // 获取主题的最后回复
        //     // Reply.getReplyById(topic.last_reply, ep.done('reply' + i));
        //     //if (topic.prototype == 'text') {
        //     //    ep.done('board' + i, null);
        //     //} else {
        //     //    Board.getBoardById(topic.board, ep.done('board' + i));
        //     //}
        // });
    });
};

exports.getImagesByQuery = function (query, opt, callback) {
    // query.deleted = false;
    Topic.find(query, {}, opt)
        .populate('board', 'id title topic_count create_at type')
        .populate('author')
        .populate('last_reply')
        .exec(function (err, topics) {
        if (err) {
            return callback(err);
        }
        if (topics.length === 0) {
            return callback(null, []);
        }

        // var proxy = new EventProxy();
        // proxy.after('topic_ready', topics.length, function () {
            topics = _.compact(topics); // 删除不合规的 topic
            return callback(null, topics);
        // });
        // proxy.fail(callback);
        //
        // topics.forEach(function (topic, i) {
        //     var ep = new EventProxy();
        //     ep.all('reply' + i, function (reply) {
        //         // 保证顺序
        //         if (reply) {
        //             topic.reply = reply;
        //         } else {
        //             topics[i] = null;
        //         }
        //         proxy.emit('topic_ready');
        //     });
        //
        //     // 获取主题的最后回复
        //     Reply.getReplyById(topic.last_reply, ep.done('reply' + i));
        // });
    });
};

/**
 * 根据Board ID，获取主题列表
 * Callback:
 * - err, 数据库异常
 * - topics, 主题列表
 * @param {String} id Board ID
 * @param {Function} callback 回调函数
 */
exports.getTopicsByBoardId = function (id, cb) {
    Topic.find({board: id, deleted: false}, '', {sort: 'create_at'}, function (err, topics) {
        if (err) {
            return cb(err);
        }
        if (topics.length === 0) {
            return cb(null, []);
        }

        var proxy = new EventProxy();
        proxy.after('reply_find', topics.length, function () {
            cb(null, topics);
        });
        for (var j = 0; j < topics.length; j++) {
            (function (i) {
                var author = topics[i].user_id;
                topics[i] = structureHelper.image(topics[i]);
                User.getUserById(author, function (err, author) {
                    if (err) {
                        return cb(err);
                    }
                    topics[i].creator = author || {_id: ''};
                    return proxy.emit('reply_find');
                });
            })(j);
        }
    });
};

// for sitemap
exports.getLimit5w = function (callback) {
    Topic.find({deleted: false}, '_id', {limit: 50000, sort: '-create_at'}, callback);
};

/**
 * 获取所有信息的主题
 * Callback:
 * - err, 数据库异常
 * - message, 消息
 * - topic, 主题
 * - author, 主题作者
 * - replies, 主题的回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getFullTopic = function (id, callback) {
    var proxy = new EventProxy();
    var events = ['topic', 'author', 'replies'];
    proxy
        .assign(events, function (topic, author, replies) {
            callback(null, '', topic, author, replies);
        })
        .fail(callback);

    Topic.findOne({_id: id, deleted: false}).populate('forum').exec(proxy.done(function (topic) {
        if (!topic) {
            proxy.unbind();
            return callback(null, '此话题不存在或已被删除。');
        }
        at.linkUsers(topic.content, proxy.done('topic', function (str) {
            topic.linkedContent = str;
            return topic;
        }));

        User.getUserById(topic.author, proxy.done(function (author) {
            if (!author) {
                proxy.unbind();
                return callback(null, '话题的作者丢了。');
            }
            proxy.emit('author', author);
        }));

        Reply.getRepliesByTopicId(topic._id, proxy.done('replies'));
    }));
};

/**
 * 获取所有信息的主题
 * Callback:
 * - err, 数据库异常
 * - message, 消息
 * - topic, 主题
 * - author, 主题作者
 * - board, 画板
 * - replies, 主题的回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getFullImage = function (id, callback) {
    var proxy = new EventProxy();
    var events = ['topic', 'author', 'replies'];
    proxy
        .assign(events, function (topic, author, replies) {
            let create_at_ago = topic.create_at_ago();
            topic = topic.toObject();
            topic.author = author;
            topic.create_at_ago = create_at_ago;
            callback(null, '', topic, replies);
        })
        .fail(callback);

    Topic.findOne({_id: id, deleted: false})
        .populate('board', 'id title topic_count create_at type')
        .exec(proxy.done(function (topic) {
        if (!topic) {
            proxy.unbind();
            return callback(null, '此话题不存在或已被删除。');
        }
        proxy.emit('topic', topic);

        User.getUserById(topic.author, proxy.done(function (author) {
            if (!author) {
                proxy.unbind();
                return callback(null, '话题的作者丢了。');
            }
            proxy.emit('author', author);
        }));

        // TODO 查看图片详细信息时, 需要获取对应 Board 中的图片列表

        Reply.getRepliesByTopicId(topic._id, proxy.done('replies'));
    }));
};

/**
 * 更新主题的最后回复信息
 * @param {String} topicId 主题ID
 * @param {String} replyId 回复ID
 * @param {Function} callback 回调函数
 */
exports.updateLastReply = function (topicId, replyId, callback) {
    Topic.findOne({_id: topicId}, function (err, topic) {
        if (err || !topic) {
            return callback(err);
        }
        topic.last_reply = replyId;
        topic.last_reply_at = new Date();
        topic.reply_count += 1;
        topic.save(callback);
    });
};

/**
 * 根据主题ID，查找一条主题
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getTopic = function (id, callback) {
    Topic.findOne({_id: id}, callback);
};

/**
 * 将当前主题的回复计数减1，并且更新最后回复的用户，删除回复时用到
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.reduceCount = function (id, callback) {
    Topic.findOne({_id: id}, function (err, topic) {
        if (err) {
            return callback(err);
        }

        if (!topic) {
            return callback(new Error('该主题不存在'));
        }
        topic.reply_count -= 1;

        Reply.getLastReplyByTopId(id, function (err, reply) {
            if (err) {
                return callback(err);
            }

            if (reply.length !== 0) {
                topic.last_reply = reply[0]._id;
            } else {
                topic.last_reply = null;
            }

            topic.save(callback);
        });

    });
};

exports.newAndSave = function (title, content, forum, authorId, callback) {
    var topic = new Topic();
    topic.title = title;
    topic.content = content;
    topic.forum = forum;
    topic.author = authorId;
    topic.type = 'text';
    topic.save(callback);
};

exports.newAndSaveImage = function (image, callback) {
    var topic = new Topic(image);

    topic.save(callback);
};
