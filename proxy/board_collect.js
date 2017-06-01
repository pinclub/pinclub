var BoardCollect = require('../models').BoardCollect;
var _ = require('lodash');

exports.getBoardCollect = function (userId, boardId, callback) {
    BoardCollect.findOne({user: userId, board: boardId}, callback);
};

exports.getTopicCollectsByUserId = function (userId, opt, callback) {
    var defaultOpt = {sort: '-create_at'};
    opt = _.assign(defaultOpt, opt);
    BoardCollect.find({user: userId}, '', opt, callback);
};

exports.newAndSave = function (userId, boardId, callback) {
    var board_collect = new BoardCollect();
    board_collect.user = userId;
    board_collect.board = boardId;
    board_collect.save(callback);
};

exports.remove = function (userId, boardId, callback) {
    BoardCollect.remove({user: userId, board: boardId}, callback);
};

