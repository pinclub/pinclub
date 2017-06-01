var TopicLike = require('../models').TopicLike;
var _ = require('lodash');

exports.getTopicLike = function (userId, topicId, callback) {
    TopicLike.findOne({user: userId, topic: topicId}, callback);
};

exports.getLikeUsers = function (topicId, callback) {
    TopicLike.find({topic: topicId}, callback)
        .populate('user', 'id loginname avatar create_at')
        .exec(callback);
};

exports.getTopicLikesByUserId = function (userId, opt, callback) {
    var defaultOpt = {sort: '-create_at'};
    opt = _.assign(defaultOpt, opt);
    TopicLike.find({user: userId}, '', opt, callback);
};

exports.getTopicLikesByUserIdAndTopicIds = function (userId, topicIds, opt, callback) {
    var defaultOpt = {sort: '-create_at'};
    opt = _.assign(defaultOpt, opt);
    TopicLike.find({user: userId, topic:{$in:topicIds}}, '', opt, callback);
};

exports.newAndSave = function (userId, topicId, callback) {
    var topic_like = new TopicLike();
    topic_like.user = userId;
    topic_like.topic = topicId;
    topic_like.save(callback);
};

exports.remove = function (userId, topicId, callback) {
    TopicLike.remove({user: userId, topic: topicId}, callback);
};

