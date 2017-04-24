var models = require('../../models');
var BoardModel = models.Board;
var BoardProxy = require('../../proxy').Board;
var config = require('../../config');
var eventproxy = require('eventproxy');
var _ = require('lodash');

/**
 * @api {get} /v2/boards 获得Board列表
 * @apiDescription
 * 获取当前用户 Board 列表
 * @apiName getBoards
 * @apiGroup board
 *
 * @apiUse ApiHeaderType
 * @apiParam {String} [type] 类型, 平台统一分类
 * @apiParam {Number} [page] 页数
 * @apiParam {Number} [limit] 每一页的主题数量
 *
 * @apiPermission none
 * @apiSampleRequest /v2/boards
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
var index = function (req, res, next) {
    var type = req.query.type;
    var currentUser = req.session.user;
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = Number(req.query.limit) || config.list_board_count;

    if (!currentUser && !currentUser._id) {
        return res.status(403).send({success: false});
    }
    var query = {};
    if (!!type) {
        query.type = type;
    }
    query.user_id = currentUser._id;
    var options = {skip: (page - 1) * limit, limit: limit, sort: '-create_at'};
    var ep = new eventproxy();
    ep.fail(next);

    BoardProxy.getBoardsByQuery(query, options, function (boards) {
        res.send({success: true, data: boards});
    });
};

/**
 * @api {post} /v2/boards 创建Board
 * @apiDescription
 * 获取当前用户 Board 列表
 * @apiName saveBoards
 * @apiGroup board

 * @apiParam {String} [type] 类型, 平台统一分类
 * @apiParam {Number} [page] 页数
 * @apiParam {Number} [limit] 每一页的主题数量
 *
 * @apiPermission none
 * @apiSampleRequest /v2/boards
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
var create = function (req, res, next) {

    var title = validator.trim(req.body.title || '');
    var tab = validator.trim(req.body.tab || '');
    var content = validator.trim(req.body.content || '');

    // 得到所有的 tab, e.g. ['ask', 'share', ..]
    var allTabs = config.tabs.map(function (tPair) {
        return tPair[0];
    });

    // 验证
    var editError;
    if (title === '') {
        editError = '标题不能为空';
    } else if (title.length < 5 || title.length > 100) {
        editError = '标题字数太多或太少';
    } else if (!tab || !_.includes(allTabs, tab)) {
        editError = '必须选择一个版块';
    } else if (content === '') {
        editError = '内容不可为空';
    }
    // END 验证

    if (editError) {
        res.status(400);
        return res.send({success: false, error_msg: editError});
    }

    TopicProxy.newAndSave(title, content, tab, req.user.id, function (err, topic) {
        if (err) {
            return next(err);
        }

        var proxy = new eventproxy();
        proxy.fail(next);

        proxy.all('score_saved', function () {
            res.send({
                success: true,
                topic_id: topic.id
            });
        });
        UserProxy.getUserById(req.user.id, proxy.done(function (user) {
            user.score += 5;
            user.topic_count += 1;
            user.save();
            req.user = user;
            proxy.emit('score_saved');
        }));

        //发送at消息
        at.sendMessageToMentionUsers(content, topic.id, req.user.id);
    });
};

exports.index = index;
exports.create = create;