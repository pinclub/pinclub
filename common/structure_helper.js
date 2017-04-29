"use strict";

var _          = require('lodash');

var image_show_fields = ['id', 'author_id', 'tab', 'content', 'title', 'last_reply_at',
    'good', 'top', 'reply_count', 'visit_count', 'create_at', 'author', 'reply', 'image', 'image_colors', 'image_fixed', 'image_source', 'type', 'board'];

var image_copy_fields = ['id', 'author_id', 'content', 'title',
    'good', 'top', 'image', 'image_colors', 'image_colors_rgb', 'image_fixed', 'image_source', 'type'];

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

exports.image = function (topic) {
    topic.author = _.pick(topic.author, ['loginname', 'avatar_url']);
    topic.board = _.pick(topic.board, ['id', 'title', 'topic_count', 'user_id']);

    topic.reply = _.pick(topic.reply, ['content', 'author', 'create_at_ago', 'id']);
    if (!!topic.reply && !!topic.reply.author) {
        topic.reply.author = _.pick(topic.reply.author, ['loginname', 'avatar_url']);
        topic.reply.create_at_ago = topic.reply.create_at_ago();
    }
    return _.pick(topic, image_show_fields);
};

exports.image_show_fields = image_show_fields;

exports.image_copy_fields = image_copy_fields;