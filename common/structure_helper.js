"use strict";

var _          = require('lodash');

exports.topic = function (topic) {
    topic.author = _.pick(topic.author, ['loginname', 'avatar_url']);

    topic.reply = _.pick(topic.reply, ['content', 'author', 'create_at_ago', 'id']);
    if (!!topic.reply && !!topic.reply.author) {
        topic.reply.author = _.pick(topic.reply.author, ['loginname', 'avatar_url']);
        topic.reply.create_at_ago = topic.reply.create_at_ago();
    }
    return _.pick(topic, ['id', 'author_id', 'tab', 'content', 'title', 'last_reply_at',
        'good', 'top', 'reply_count', 'visit_count', 'create_at', 'author', 'reply', 'image']);
};