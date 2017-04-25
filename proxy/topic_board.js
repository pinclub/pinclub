var TopicBoard = require('../models').TopicBoard;
var _ = require('lodash');

exports.getTopicBoard = function (userId, topicId, callback) {
  TopicBoard.findOne({user_id: userId, topic_id: topicId}, callback);
};

exports.getTopicBoardsByUserId = function (userId, opt, callback) {
  var defaultOpt = {sort: '-create_at'};
  opt = _.assign(defaultOpt, opt);
  TopicBoard.find({user_id: userId}, '', opt, callback);
};

exports.getTopicsByBoardId = function (boardId, opt, callback) {
  var defaultOpt = {sort: '-create_at'};
  opt = _.assign(defaultOpt, opt);
  TopicBoard.find({board_id: boardId}, '', opt, callback);
};

exports.newAndSave = function (userId, topicId, boardId, desc, tags, callback) {
  var topic_board     = new TopicBoard();
  topic_board.user_id  = userId;
  topic_board.topic_id = topicId;
  topic_board.board_id = boardId;
  topic_board.desc = desc;
  topic_board.tags = tags;
  topic_board.save(callback);
};

exports.remove = function (userId, topicId, boardId, callback) {
  TopicBoard.remove({user_id: userId, topic_id: topicId, board_id: boardId}, callback);
};

