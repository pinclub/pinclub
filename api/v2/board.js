var BoardProxy = require('../../proxy').Board;
var UserProxy = require('../../proxy').User;
var config = require('../../config');
var EventProxy = require('eventproxy');
var validator = require('validator');

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
    var ep = new EventProxy();
    ep.fail(next);

    BoardProxy.getBoardsByQuery(query, options, function (err, boards) {
        if (err) {
            return res.status(500).send({success: false});
        }
        res.send({success: true, data: boards});
    });
};

/**
 * @api {post} /v2/boards 创建Board
 * @apiDescription
 * 获取当前用户 Board 列表
 * @apiName saveBoards
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
var create = function (req, res, next) {

    var title = validator.trim(req.body.title || '');
    var type = validator.trim(req.body.type || '');

    // 验证
    var editError;
    if (title === '') {
        editError = '标题不能为空';
    } else if (title.length > 20) {
        title = title.substr(0, 20);
    }
    // END 验证

    if (editError) {
        res.status(400);
        return res.send({success: false, error_msg: editError});
    }

    BoardProxy.newAndSave(title, type, req.session.user.id, function (err, board) {
        if (err) {
            return next(err);
        }

        var proxy = new EventProxy();
        proxy.fail(next);

        proxy.all('score_saved', function () {
            res.send({
                success: true,
                board: board.id,
                title: board.title
            });
        });
        UserProxy.getUserById(req.session.user.id, proxy.done(function (user) {
            user.score += 5;
            user.board_count += 1;
            user.save();
            req.user = user;
            proxy.emit('score_saved');
        }));
    });
};

// TODO 关注 board
// TODO 取消关注 board

exports.index = index;
exports.create = create;