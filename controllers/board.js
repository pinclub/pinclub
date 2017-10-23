var _ = require('lodash');
var Board = require('../proxy').Board;
var BoardCollect = require('../proxy').BoardCollect;
var Topic = require('../proxy').Topic;
var User = require('../proxy').User;
var EventProxy = require('eventproxy');

// DONE (hhdem) 用户Board列表
exports.index = function (req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);

    ep.on('user', function (user) {
        var query = {user_id: req.session.user._id, deleted: {$ne: true}};
        let u = req.session.user;
        let isOwner = false;
        if (!!user) {
            query.user_id = user._id;
            u = user;
            if (user.id == req.session.user.id) {
                isOwner = true;
            }
        } else {
            isOwner = true;
        }
        Board.getBoardsByQuery(query, {}, function (err, boards) {
            _.forEach(boards, function(board) {
                Topic.getImagesByQuery({
                    board: board.id
                }, {
                    limit: 4
                }, function (err, topics) {
                    board.topics = topics;
                    ep.emit('topic');
                });
            });
            ep.after('topic', boards.length, function () {
                res.render('board/index', {
                    boards: boards,
                    user: u,
                    isOwner: isOwner
                });
            });
        });
    });


    var loginname = req.params.name;
    if (!!loginname) {
        User.getUserByLoginName(loginname, ep.done('user'));
    } else {
        ep.emit('user', null);
    }
};

// DONE (hhdem) 用户Board信息查看, 显示Board中的图片列表
exports.show = function (req, res, next) {
    req.checkParams({
        'board_id': {
            notEmpty: {
                options: [true],
                errorMessage: 'Board Id 不能为空'
            },
            isMongoId: {
                options: [true],
                errorMessage: 'Board Id 格式不正确'
            }
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
        var ep = new EventProxy();
        let isCreator = false;
        ep.fail(next);
        ep.on('is_collect', function(is_collect) {
            Board.getFullBoard(req.params.board_id, function (err, msg, board, creator, topics) {
                if (err) {
                    return next(err);
                }
                if (!board) {
                    return res.status(404).json({
                        success: false,
                        err_message: 'Board不存在'
                    }).end();
                }
                board.creator = creator;
                if (!!req.session.user){
                    isCreator = (req.session.user.id == creator.id);
                }
                res.render('board/topics', {
                    board: board,
                    is_collect: is_collect,
                    topics: topics,
                    is_creator: isCreator
                });
            });
        });
        if (!!req.session.user) {
            BoardCollect.getBoardCollect(req.session.user._id, req.params.board_id, function (err, doc) {
                if (err) {
                    return next(err);
                }
                if (doc) {
                    ep.emit('is_collect', true);
                } else {
                    ep.emit('is_collect', false);
                }
            });
        } else {
            ep.emit('is_collect', false);
        }

    });
};

function update (req, res, cb) {
    req.checkBody({
        'title': {
            notEmpty: {
                options: [true],
                errorMessage: 'Board 名称不能为空'
            }
        },
        'type': {
            notEmpty: {
                options: [true],
                errorMessage: 'type 不能为空'
            },
            matches: {
                options: ['public|private'],
                errorMessage: 'type 必须为 public,private'
            }
        }
    });
    req.checkParams({
        'board_id': {
            notEmpty: {
                options: [true],
                errorMessage: 'Board Id 不能为空'
            },
            isMongoId: {
                options: [true],
                errorMessage: 'Board Id 格式不正确'
            }
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

        Board.getBoard(req.params.board_id, function (err, board) {
            if (err) {
                return cb(err);
            }

            board.title = req.body.title;
            board.type = req.body.type;
            board.save();
            cb();
        });
    });
}

// DONE (hhdem) 用户Board信息删除
exports.delete = function (req, res, next) {
    req.checkParams({
        'board_id': {
            notEmpty: {
                options: [true],
                errorMessage: 'id 不能为空'
            }
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

        Board.getBoard(req.params.board_id, function (err, board) {
            if (err) {
                return next(err);
            }

            board.deleted = true;
            board.save();
            User.getUserById(board.user_id, function (err, user) {
                user.score -= 5;
                user.board_count -= 1;
                user.save();
                req.session.user = req.user = user;
                return res.redirect('/boards');
            });
        });
    });
};

// DONE 用户Board列表页创建Board信息
exports.create = function (req, res, next) {
    req.checkBody({
        'title': {
            notEmpty: {
                options: [true],
                errorMessage: 'Board 名称不能为空'
            }
        },
        'type': {
            notEmpty: {
                options: [true],
                errorMessage: 'type 不能为空'
            },
            matches: {
                options: ['public|private'],
                errorMessage: 'type 必须为 public,private'
            }
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

        Board.newAndSave(req.body.title, req.body.type, req.session.user.id, function (err, board) {
            if (err) {
                return next(err);
            }

            var proxy = new EventProxy();
            proxy.fail(next);

            User.getUserById(req.session.user.id, function (err, user) {
                user.score += 5;
                user.board_count += 1;
                user.save();
                req.session.user = req.user = user;
                return res.redirect('/boards');
            });
        });
    });
};

// DONE(hhdem) 用户Board列表页修改Board信息
exports.edit = function (req, res, next) {
    update(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                success: false,
                err_message: '修改Board信息失败'
            }).end();
        }
        return res.redirect('/boards');
    });
};

// DONE(hhdem) 管理员修改 Board 信息
exports.adminEdit = function (req, res, next) {
    update(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                success: false,
                err_message: '修改Board信息失败'
            }).end();
        }
        return res.redirect('/admin/boards');
    });
};

// 关注Board
exports.collect = function (req, res, next) {
    var board_id = req.body.id;

    Board.getBoard(board_id, function (err, board) {
        if (err) {
            return next(err);
        }

        BoardCollect.getBoardCollect(req.session.user._id, board._id, function (err, doc) {
            if (err) {
                return next(err);
            }
            if (doc) {
                BoardCollect.remove(req.session.user._id, board._id, function (err, removeResult) {
                    if (err) {
                        return next(err);
                    }
                    if (removeResult.result.n === 0) {
                        return res.json({
                            success: false,
                            err_message: '关注Board信息失败'
                        });
                    }

                    User.getUserById(req.session.user._id, function (err, user) {
                        if (err) {
                            return next(err);
                        }
                        user.collect_board_count -= 1;
                        req.session.user = user;
                        user.save();
                    });

                    board.collect_count -= 1;
                    board.save();

                    res.json({
                        success: true,
                        err_message: '关注Board信息成功'
                    });
                });
            } else {

                BoardCollect.newAndSave(req.session.user._id, board._id, function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.json({
                        success: true,
                        err_message: '关注Board信息成功'
                    });
                });
                User.getUserById(req.session.user._id, function (err, user) {
                    if (err) {
                        return next(err);
                    }
                    user.collect_board_count += 1;
                    user.save();
                });

                req.session.user.collect_topic_count += 1;
                board.collect_count += 1;
                board.save();
            }
        });
    });
};

/**
 * 刷新画板主题数量
 * @param req
 * @param res
 * @param next
 */
exports.refreshCount = function (req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: {
                options: [true],
                errorMessage: 'Board名称不能为空'
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
        Topic.getCountByQuery({board: id, type:'image', deleted: false}, function (err, count) {
            if (!!err) {
                return next (err);
            }
            Board.getBoard(id, function (err, board) {
                if (!!err) {
                    return next (err);
                }
                if (board.topic_count != count) {
                    board.topic_count = count;
                    board.save();
                }
                res.send({success: true, topic_count: count});
            });
        });
    });
};