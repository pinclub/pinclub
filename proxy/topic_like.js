var TopicLike = require('../models').TopicLike;
var _ = require('lodash');

exports.getTopicLike = function (userId, topicId, callback) {
  TopicLike.findOne({user_id: userId, topic_id: topicId}, callback);
};

exports.getTopicLikesByUserId = function (userId, opt, callback) {
  var defaultOpt = {sort: '-create_at'};
  opt = _.assign(defaultOpt, opt);
  TopicLike.find({user_id: userId}, '', opt, callback);
};

exports.newAndSave = function (userId, topicId, callback) {
  var topic_like      = new TopicLike();
  topic_like.user_id  = userId;
  topic_like.topic_id = topicId;
  topic_like.save(callback);
};

exports.remove = function (userId, topicId, callback) {
  TopicLike.remove({user_id: userId, topic_id: topicId}, callback);
};

