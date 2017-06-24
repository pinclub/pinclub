var _ = require('lodash');
var EventProxy = require('eventproxy');
var UserProxy = require('../../proxy').User;
var TopicProxy = require('../../proxy').Topic;
var ReplyProxy = require('../../proxy').Reply;
var structureHelper = require('../../common/structure_helper');

var show = function (req, res, next) {
    var loginname = req.params.loginname;
    var ep = new EventProxy();

    ep.fail(next);

    UserProxy.getUserByLoginName(loginname, ep.done(function (user) {
        if (!user) {
            res.status(404);
            return res.send({success: false, error_msg: '用户不存在'});
        }
        var query = {author: user._id};
        var opt = {limit: 15, sort: '-create_at'};
        TopicProxy.getTopicsByQuery(query, opt, ep.done('recent_topics'));

        ReplyProxy.getRepliesByAuthorId(user._id, {limit: 20, sort: '-create_at'},
            ep.done(function (replies) {
                var topic_ids = replies.map(function (reply) {
                    return reply.topic.id;
                });
                topic_ids = _.uniq(topic_ids).slice(0, 5); //  只显示最近5条

                var query = {_id: {'$in': topic_ids}};
                var opt = {};
                TopicProxy.getTopicsByQuery(query, opt, ep.done('recent_replies', function (recent_replies) {
                    recent_replies = _.sortBy(recent_replies, function (topic) {
                        return topic_ids.indexOf(topic._id.toString());
                    });
                    return recent_replies;
                }));
            }));

        ep.all('recent_topics', 'recent_replies',
            function (recent_topics, recent_replies) {

                user = structureHelper.user(user);

                user.recent_topics = recent_topics.map(function (topic) {
                    topic.author = structureHelper.user(topic.author);
                    topic = _.pick(topic, ['id', 'author', 'title', 'last_reply_at']);
                    return topic;
                });
                user.recent_replies = recent_replies.map(function (topic) {
                    topic.author = structureHelper.user(topic.author);
                    topic = _.pick(topic, ['id', 'author', 'title', 'last_reply_at']);
                    return topic;
                });

                res.send({success: true, data: user});
            });
    }));
};

var list = function (req, res, next) {
    req.checkQuery({
        'q': {
            notEmpty: {
                options: [true],
                errorMessage: 'q 不能为空'
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
        var ep = new EventProxy();

        ep.fail(next);

        let qs = req.query.q;
        var query = {
            loginname: {'$regex': qs}
        };
        UserProxy.getUsersByQuery(query, function (err, users) {
            if (err) {
                return next(err);
            }
            _.forEach(users, function (user) {
                user = structureHelper.user(user);
            });
            res.send({success: true, data: users});
        });
    });
};

exports.show = show;
exports.list = list;
