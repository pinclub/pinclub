var _ = require('lodash');
var Board = require('../proxy').Board;
var Topic = require('../proxy').Topic;
var User = require('../proxy').User;
var EventProxy = require('eventproxy');

// DONE (hhdem) 用户Board列表
exports.index = function (req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    var query = {};
    if (!req.session.user.is_admin) {
        query = {user_id: req.session.user};
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
                boards: boards
            });
        });
    });

};

// TODO 用户Board信息查看
exports.show = function (req, res, next) {
    res.render('static/function_building', {
        title: 'Board信息查看'
    });
};

// TODO 用户Board信息修改
exports.update = function (req, res, next) {
    res.render('static/function_building', {
        title: 'Board信息修改'
    });
};

// TODO 用户Board信息删除
exports.delete = function (req, res, next) {
    res.render('static/function_building', {
        title: 'Board信息删除'
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

// DONE 用户Board列表页修改Board信息
exports.edit = function (req, res, next) {
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
                return next(err);
            }

            board.title = req.body.title;
            board.type = req.body.type;
            board.save();
            return res.redirect('/boards');
        });
    });
};