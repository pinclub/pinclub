var _ = require('lodash');
var BoardProxy = require('../../proxy').Board;
var UserProxy = require('../../proxy').User;
var BoardCollect = require('../../proxy').BoardCollect;
var config = require('../../config');
var EventProxy = require('eventproxy');
var validator = require('validator');
var counter = require('../../common/counter');

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

/**
 * DONE (hhdem) 关注 board
 * @api {post} /v2/boards/collect 关注对应 board
 * @apiDescription
 * 关注对应 board
 * @apiName collectBoards
 * @apiGroup board
 *
 * @apiUse ApiHeaderType
 * @apiParam {String} board_id board id
 *
 * @apiPermission none
 * @apiSampleRequest /v2/boards
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
var collect = function (req, res, next) {
    var board_id = req.body.board_id;
    if (!validator.isMongoId(board_id)) {
        res.status(500);
        return res.send({success: false, error_msg: '不是有效的board_id'});
    }
    BoardProxy.getBoard(board_id, function (err, board) {
        if (err) {
            return next(err);
        }
        if (!board) {
            res.status(404).json({success: false});
        }

        BoardCollect.getBoardCollect(req.session.user._id, board_id, function (err, doc) {
            if (err) {
                return next(err);
            }
            if (doc) {
                res.json({success: false, error_msg: 'You already collect this board.'});
                return;
            }

            BoardCollect.newAndSave(req.session.user._id, board_id, function (err) {
                if (err) {
                    return next(err);
                }
                counter.user(req.session.user._id, 'board', 'collect', function (err, user) {
                    if (err) {
                        return next(err);
                    }
                    req.session.user.collect_board_count += 1;
                    board.collect_count += 1;
                    board.save();
                    res.json({success: true});
                });
            });
        });
    });
};

/**
 * DONE (hhdem) 取消关注 board
 * @api {post} /v2/boards/de_collect 取消关注Board
 * @apiDescription
 * 取消关注对应的Board
 * @apiName decollectBoards
 * @apiGroup board
 *
 * @apiUse ApiHeaderType
 * @apiParam {String} board_id ID
 *
 * @apiPermission none
 * @apiSampleRequest /v2/boards
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
var decollect = function (req, res, next) {
    var board_id = req.body.board_id;
    if (!validator.isMongoId(board_id)) {
        res.status(500);
        return res.send({success: false, error_msg: '不是有效的board_id'});
    }
    BoardProxy.getBoard(board_id, function (err, board) {
        if (err) {
            return next(err);
        }
        if (!board) {
            res.status(404).json({success: false});
        }
        BoardCollect.remove(req.session.user._id, board_id, function (err, removeResult) {
            if (err) {
                return next(err);
            }
            if (removeResult.result.n === 0) {
                return res.json({success: false});
            }

            counter.user(req.session.user._id, 'board', 'decollect', function (err, user) {
                if (err) {
                    return next(err);
                }
                user.collect_board_count -= 1;
                req.session.user = user;

                board.collect_count -= 1;
                board.save();

                res.json({success: true});
            });
        });
    });
};

/**
 * DONE (hhdem) 关注列表
 * @api {get} /v2/boards/collect/:loginname 用户关注列表
 * @apiDescription
 * 用户关注列表
 * @apiName userCollectBoards
 * @apiGroup board
 *
 * @apiParam {String} loginname 用户登录名
 *
 * @apiPermission none
 * @apiSampleRequest /v2/boards
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
function collectList(req, res, next) {
    var loginname = req.params.loginname;
    var ep        = new EventProxy();

    ep.fail(next);

    UserProxy.getUserByLoginName(loginname, ep.done(function (user) {
        if (!user) {
            return res.status(404).json({success: false, error_msg: '用户不存在'});
        }

        // api 返回 100 条就好了
        BoardCollect.getBoardCollectsByUserId(user._id, {limit: 100}, ep.done('collected_boards'));

        ep.all('collected_boards', function (collected_topics) {

            var ids = collected_topics.map(function (doc) {
                return String(doc.board);
            });
            var query = { _id: { '$in': ids } };
            BoardProxy.getBoardsByQuery(query, {}, ep.done('boards', function (boards) {
                boards = _.sortBy(boards, function (board) {
                    return ids.indexOf(String(board._id));
                });
                return boards;
            }));

        });

        ep.all('boards', function (boards) {
            boards = boards.map(function (board) {
                board.author = _.pick(board.author, ['loginname', 'avatar_url']);
                return _.pick(board, ['id', 'author_id', 'tab', 'content', 'title', 'last_reply_at',
                    'good', 'top', 'reply_count', 'visit_count', 'create_at', 'author']);
            });
            res.send({success: true, data: boards});

        });
    }));
}

exports.collectList = collectList;
exports.index = index;
exports.create = create;
exports.collect = collect;
exports.decollect = decollect;