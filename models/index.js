var mongoose = require('mongoose');
var config = require('../config');
var logger = require('../common/logger');

mongoose.connect(config.db, {
    server: {poolSize: 20}
}, function (err) {
    if (err) {
        logger.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});

// models
require('./user');
require('./topic');
require('./board');
require('./reply');
require('./topic_collect');
require('./topic_like');
require('./topic_board');
require('./message');

exports.User = mongoose.model('User');
exports.Topic = mongoose.model('Topic');
exports.Board = mongoose.model('Board');
exports.Reply = mongoose.model('Reply');
exports.TopicCollect = mongoose.model('TopicCollect');
exports.TopicLike = mongoose.model('TopicLike');
exports.TopicBoard = mongoose.model('TopicBoard');
exports.Message = mongoose.model('Message');
