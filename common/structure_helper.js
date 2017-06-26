"use strict";

var _          = require('lodash');
var moment = require('moment');
var mongoose = require('mongoose');

var image_show_fields = ['_id', 'id', 'author', 'tab', 'content', 'title', 'last_reply_at',
    'good', 'top', 'reply_count', 'visit_count', 'create_at', 'create_at_ago', 'author', 'last_reply', 'image', 'image_colors',
    'image_fixed', 'image_86', 'image_430', 'image_source', 'type', 'board', 'like_count', 'geted_count', 'profile_source'];

var image_copy_fields = ['author', 'content', 'title',
    'top', 'image', 'image_hash', 'image_colors', 'image_colors_rgb', 'image_fixed', 'image_86', 'image_430', 'image_source', 'type', 'profile_source'];

var user_show_fields = ['loginname', 'avatar_url', 'githubUsername',
    'create_at', 'score', 'topic_count', 'image_count', 'board_count', 'reply_count', 'follower_count', 'following_count', 'collect_tag_count',
    'collect_topic_count', 'like_image_count', 'get_image_count', 'topic_collect_count'];

var topic_user_fields = ['_id', 'id', 'author', 'author', 'tab', 'content', 'title', 'last_reply_at',
    'good', 'top', 'reply_count', 'visit_count', 'create_at', 'create_at_ago', 'author', 'last_reply', 'image', 'forum'];

exports.user = function (user) {
    return _.pick(user, user_show_fields);
};

exports.topic = function (topic) {
    let avatar_url = topic.author.avatar_url;
    let last_reply_create_at_ago = topic.last_reply?topic.last_reply.create_at : null;
    let id = topic.id;
    if (topic instanceof mongoose.Model) {
        last_reply_create_at_ago = topic.last_reply?topic.last_reply.create_at_ago() : null;
        topic = topic.toObject();
        topic.author.avatar_url = avatar_url;
        if (id) {
            topic.id = id;
        }
    }
    topic.author = _.pick(topic.author, ['_id', 'id', 'loginname', 'avatar_url']);
    topic.forum = _.pick(topic.forum, ['_id', 'id', 'title', 'topic_count', 'content']);

    if (!!topic.last_reply && !!topic.last_reply.author) {
        topic.last_reply.author = _.pick(topic.last_reply.author, ['_id', 'id', 'loginname', 'avatar_url']);
        topic.last_reply.create_at_ago = last_reply_create_at_ago;
        topic.last_reply = _.pick(topic.last_reply, ['content', 'create_at_ago', 'author', 'id', '_id']);
        topic.last_reply_at = moment(topic.last_reply_at).format("yyyy-MM-dd HH:mm:ss");
    }
    return _.pick(topic, topic_user_fields);
};

exports.image = function (topic) {
    let avatar_url = topic.author.avatar_url;
    let last_reply_create_at_ago = topic.last_reply?topic.last_reply.create_at : null;
    let id = topic.id;
    if (topic instanceof mongoose.Model) {
        last_reply_create_at_ago = topic.last_reply?topic.last_reply.create_at_ago() : null;
        topic = topic.toObject();
        topic.author.avatar_url = avatar_url;
        if (id) {
            topic.id = id;
        }
    }
    topic.author = _.pick(topic.author, ['id', 'loginname', 'avatar_url']);
    if (!!topic.board && !topic.board.id && !!topic.board._id) {
        topic.board.id = topic.board._id.toString();
    }
    topic.board = _.pick(topic.board, ['id', 'title', 'topic_count', 'user_id', 'images']);

    if (!!topic.last_reply && !!topic.last_reply.author) {
        topic.last_reply.author = _.pick(topic.reply.author, ['id', 'loginname', 'avatar_url']);
        topic.last_reply.create_at_ago = last_reply_create_at_ago;
        topic.last_reply = _.pick(topic.last_reply, ['content', 'create_at_ago', 'author', 'id']);
        topic.last_reply_at = moment(topic.last_reply_at).format("yyyy-MM-dd HH:mm:ss");
    }
    return _.pick(topic, image_show_fields);
};

exports.reply = function (reply) {
    reply.author = _.pick(reply.author, ['loginname', 'avatar_url']);
    reply = _.pick(reply, ['id', 'author', 'content', 'ups', 'create_at', 'reply_id']);
    return reply;
};

exports.topic_user_fields = topic_user_fields;

exports.user_show_fields = user_show_fields;

exports.image_show_fields = image_show_fields;

exports.image_copy_fields = image_copy_fields;