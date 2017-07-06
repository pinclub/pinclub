var EventProxy = require('eventproxy');
var models = require('../models');
var Node = models.Node;
var User = require('./user');
var Topic = require('./topic');
var _ = require('lodash');
var config       = require('../config');
var tools = require('../common/tools');


/**
 * 根据ID获取节点信息
 * Callback:
 * - err, 数据库错误
 * - node, 节点
 * - creator, 创建者
 * @param {String} id Node ID
 * @param {Function} callback 回调函数
 */
exports.getNodeById = function (id, callback) {

};

/**
 * 获取关键词能搜索到的节点数量
 * Callback:
 * - err, 数据库错误
 * - count, 节点数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
    Node.count(query, callback);
};

/**
 * 根据关键词，获取节点 (Node) 列表
 * Callback:
 * - err, 数据库错误
 * - nodes, Node 列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getNodesByQuery = function (query, opt, callback) {
    Node.find(query, {}, opt).lean()
        .populate('creator')
        .populate('parent')
        .populate('subs')
        .exec(function (err, nodes) {
            if (err) {
                return callback(err);
            }
            if (nodes.length === 0) {
                return callback(null, []);
            }
            _.forEach(nodes, function (node) {
                node.create_at_ago = tools.formatDate(node.create_at, true);
                node.update_at_ago = tools.formatDate(node.update_at, true);
            });

            nodes = _.compact(nodes); // 删除不合规的 topic
            return callback(null, nodes);

        });
};

/**
 * 获取节点信息
 * Callback:
 * - err, 数据库异常
 * - message, 消息
 * - node, 节点
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getFullNode = function (id, callback) {
    var proxy = new EventProxy();
    var events = ['node'];
    proxy
        .assign(events, function (node) {
            callback(null, '', node);
        })
        .fail(callback);

    Node.findOne({_id: id}).lean()
        .populate('creator')
        .populate('parent')
        .exec(proxy.done(function (node) {
            if (!node) {
                proxy.unbind();
                return callback(null, '此节点不存在或已被删除。');
            }
            node.create_at_ago = tools.formatDate(node.create_at, true);
            node.update_at_ago = tools.formatDate(node.update_at, true);
            proxy.emit('node', node);
        }));
};

/**
 * 根据Node ID，查找
 * @param {String} id Node ID
 * @param {Function} callback 回调函数
 */
exports.getNode = function (id, callback) {
    Node.findOne({_id: id}, callback);
};

exports.newAndSave = function (nodeObj, callback) {
    var node = new Node(nodeObj);
    node.save(callback);
};
