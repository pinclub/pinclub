var mongoose = require('mongoose');
var path = require('path');
var config = require('../config');
var logger = require('../common/logger');
var restore = require('mongodb-restore');
// var backup = require('mongodb-backup');

mongoose.connect(config.db + config.dbname, {
    server: {poolSize: 20}
}, function (err) {
    if (err) {
        logger.error('connect to %s error: ', config.db + config.dbname, err.message);
        process.exit(1);
    }
    if (process.env.NODE_ENV === 'init' || process.env.NODE_ENV === 'test') {

        // backup(
        //     {
        //         uri: 'mongodb://localhost:27017/node_test'
        //         ,	root: __dirname,
        //         collections: ['system.js']
        //     }
        // );

        restore({
            uri: config.db + config.dbname, // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
            root: path.join(__dirname, '../bin/dbstore/' + config.dbname),
            drop: true,
            callback: function (err) {
                console.info(err);
            }
        });
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
