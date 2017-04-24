var EventProxy = require('eventproxy');
var models = require('../models');
var Board = models.Board;
var User = require('./user');
var Topic = require('./topic');
var tools = require('../common/tools');
var at = require('../common/at');
var _ = require('lodash');


/**
 * 根据画板ID获取画板
 * Callback:
 * - err, 数据库错误
 * - board, 画板
 * - creator, 创建者
 * - lastAction, 最后动作
 * @param {String} id Board ID
 * @param {Function} callback 回调函数
 */
exports.getBoardById = function (id, callback) {
    var proxy = new EventProxy();
    var events = ['board', 'creator', 'topics'];
    proxy.assign(events, function (board, creator, topics) {
        if (!creator) {
            return callback(null, null, null, null);
        }
        return callback(null, board, creator, topics);
    }).fail(callback);

    Board.findOne({_id: id}, proxy.done(function (board) {
        if (!board) {
            proxy.emit('board', null);
            proxy.emit('creator', null);
            proxy.emit('topics', null);
            return;
        }
        proxy.emit('board', board);

        User.getUserById(board.user_id, proxy.done('creator'));

        if (board.topic_count) {
            var options = { limit: 5};
            var query = { board_id: id };
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
    Board.count(query, callback);
};

/**
 * 根据关键词，获取画板 (Board) 列表
 * Callback:
 * - err, 数据库错误
 * - count, Board 列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getBoardsByQuery = function (query, opt, callback) {
    Board.find(query, {}, opt, function (err, boards) {
        if (err) {
            return callback(err);
        }
        if (boards.length === 0) {
            return callback(null, []);
        }

        var proxy = new EventProxy();
        proxy.after('board_ready', boards.length, function () {
            boards = _.compact(boards); // 删除不合规的 topic
            return callback(null, boards);
        });
        proxy.fail(callback);

        boards.forEach(function (board, i) {
            var ep = new EventProxy();
            ep.all('creator', 'reply', function (creator, reply) {
                // 保证顺序
                // 作者可能已被删除
                if (creator) {
                    board.creator = author;
                } else {
                    boards[i] = null;
                }
                proxy.emit('board_ready');
            });

            User.getUserById(board.user_id, ep.done('creator'));
        });
    });
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
exports.getFullBoard = function (id, callback) {
    var proxy = new EventProxy();
    var events = ['board', 'creator', 'topics'];
    proxy
        .assign(events, function (board, creator, topics) {
            callback(null, '', board, creator, topics);
        })
        .fail(callback);

    Board.findOne({_id: id}, proxy.done(function (board) {
        if (!board) {
            proxy.unbind();
            return callback(null, '此画板不存在或已被删除。');
        }
        proxy.emit('board', board);

        User.getUserById(board.user_id, proxy.done(function (creator) {
            if (!author) {
                proxy.unbind();
                return callback(null, '画板的作者丢了。');
            }
            proxy.emit('creator', creator);
        }));

        Topic.getTopicsByBoardId(board._id, proxy.done('topics'));
    }));
};


/**
 * 根据Board ID，查找
 * @param {String} id Board ID
 * @param {Function} callback 回调函数
 */
exports.getBoard = function (id, callback) {
    Board.findOne({_id: id}, callback);
};

/**
 * 将当前 Board 的主题计数减1\
 * @param {String} id Board ID
 * @param {Function} callback 回调函数
 */
exports.reduceTopicCount = function (id, callback) {
    Board.findOne({_id: id}, function (err, board) {
        if (err) {
            return callback(err);
        }

        if (!board) {
            return callback(new Error('该Board不存在'));
        }
        board.topic_count -= 1;
        board.save(callback);
    });
};

exports.newAndSave = function (title, type, creatorId, callback) {
    var board = new Board();
    board.title = title;
    board.type = type;
    board.user_id = creatorId;
    board.save(callback);
};
