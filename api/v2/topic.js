var TopicProxy = require('../../proxy').Topic;
var TopicCollect = require('../../proxy').TopicCollect;
var TopicLike = require('../../proxy').TopicLike;
var UserProxy = require('../../proxy').User;
var ForumProxy = require('../../proxy').Forum;
var config = require('../../config');
var EventProxy = require('eventproxy');
var _ = require('lodash');
var at = require('../../common/at');
var renderHelper = require('../../common/render_helper');
var structureHelper = require('../../common/structure_helper');
var tools = require('../../common/tools');
var cache = require('../../common/cache');
var validator = require('validator');


/**
 * @api {get} /v2/topics 主题列表
 * @apiDescription
 * 获取本站主题列表
 * @apiName getTopics
 * @apiGroup topic
 *
 * @apiParam {String} type 类型, image 图片 text 文字(默认)
 * @apiParam {String} author 用户Id
 * @apiParam {Number} page 页数
 * @apiParam {String} tab 主题分类。目前有 ask share job good
 * @apiParam {Number} limit 每一页的主题数量
 * @apiParam {String} mdrender 当为 false 时，不渲染。默认为 true，渲染出现的所有 markdown 格式文本
 *
 * @apiPermission none
 * @apiSampleRequest /v2/topics
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
          "success": true,
          "data": [
              {
                  "id": "",
                  "author": "",
                  "tab": "ask",
                  "content": "",
                  "title": "",
                  "last_reply_at": "",
                  "good": false,
                  "top": false,
                  "reply_count": 2,
                  "visit_count": 8,
                  "create_at": "",
                  "author": {
                      "loginname": "admin",
                      "avatar_url": "//gravatar.com/avatar/80579ac37c768d5dffa97b46bb4754f2?size=48"
                  },
                  "reply": {
                      "author": {
                          "loginname": "admin",
                          "avatar_url": "//gravatar.com/avatar/80579ac37c768d5dffa97b46bb4754f2?size=48"
                      },
                      "content": "回复内容",
                      "create_at_ago", "几秒前",
                      "id": ""
                  }
              }
          ]
      }
 */
var index = function (req, res, next) {
    var type = req.query.type || 'text';
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var forum = req.query.forum;
    var author = req.query.author;
    var limit = Number(req.query.limit) || config.list_topic_count;
    var currentUser = req.session.user;

    var query = {};
    if (forum && forum !== 'all') {
        if (forum === 'good') {
            query.good = true;
        } else {
            query.forum = forum;
        }
    } else if (forum === 'all') {
        delete query.forum;
    }
    if (!!author) {
        query.author = author;
    }
    query.deleted = false;
    query.type = type;
    var options = {skip: (page - 1) * limit, limit: limit, sort: '-top -last_reply_at'};

    var ep = new EventProxy();
    ep.fail(next);

    ep.all('topics', 'liked_topics', 'topics_count', 'child_forums', function (topics, liked_topics, topics_count, child_forums) {
        let liked_t_ids = _.map(liked_topics, 'topic_id');
        topics = topics.map(function (topic) {
            let structedTopic = structureHelper.topic(topic);
            liked_t_ids.forEach(function(lti){
                let tid = lti.toString();
                if (topic.id === tid) {
                    structedTopic.liked = true;
                }
            });

            return structedTopic;
        });

        res.send({success: true, data: topics, total_count: topics_count, child_forums:child_forums});
    });

    // 获得对应 forum 的 topics
    ep.on('forums',
        function (forums) {
            var queryForm = {};
            query.good? queryForm.good = true:null;
            var forumIds = _.map(forums, '_id');
            queryForm.forum = {$in: forumIds};
            let selectForum = query.forum;
            forums = _.dropWhile(forums, function(obj) {
                return obj._id == selectForum;
            });
            ep.emit('child_forums', !query.forum? []:forums);

            TopicProxy.getCountByQuery(queryForm, ep.done('topics_count'));
            TopicProxy.getTopicsByQuery(queryForm, options, ep.done('topics', function (topics) {
                if (!!currentUser) {
                    let topic_t_ids = _.map(topics, 'id');
                    TopicLike.getTopicLikesByUserIdAndTopicIds(req.session.user._id, topic_t_ids, {}, ep.done('liked_topics'));
                } else {
                    ep.emit('liked_topics', []);
                }
                return topics;
            }));


        });

    // 取可以展示的 forums 列表
    var queryForum = {};
    let queryStr = "";
    queryForum.type = 'public';
    if (!!currentUser) {
        queryForum.type = {$ne: 'private'};
    }
    if (!!query.forum) {
        // queryForum.code = eval('/' + query.forum + '/');
        queryStr = query.forum;
    }
    if (!!query.show_type) {
        queryForum.show_type = query.show_type;
    }
    var forumsCacheKey = JSON.stringify(queryForum) + queryStr + 'pages';
    cache.get(forumsCacheKey, ep.done(function (forums) {
        if (forums) {
            ep.emit('forums', forums);
        } else {
            if (!!query.forum) {
                ForumProxy.getForum(query.forum, function (err, forum) {
                    if (!!forum.code) {
                        queryForum.code = eval('/' + forum.code + '/');
                        ForumProxy.getForumsByQuery(queryForum, {}, ep.done(function (forums) {
                            cache.set(forumsCacheKey, forums, 60 * 1);
                            ep.emit('forums', forums);
                        }));
                    } else {
                        ep.emit('forums', [forum]);
                    }
                });
            } else {
                ForumProxy.getForumsByQuery(queryForum, {limit: 10}, ep.done(function (forums) {
                    cache.set(forumsCacheKey, forums, 60 * 1);
                    ep.emit('forums', forums);
                }));
            }
        }
    }));

};

exports.index = index;

var show = function (req, res, next) {
    var topicId = String(req.params.id);

    var mdrender = req.query.mdrender === 'false' ? false : true;
    var ep = new EventProxy();

    if (!validator.isMongoId(topicId)) {
        res.status(400);
        return res.send({success: false, error_msg: '不是有效的话题id'});
    }

    ep.fail(next);

    TopicProxy.getFullTopic(topicId, ep.done(function (msg, topic, author, replies) {
        if (!topic) {
            res.status(404);
            return res.send({success: false, error_msg: '话题不存在'});
        }
        topic = _.pick(topic, ['id', 'author', 'forum', 'content', 'title', 'last_reply', 'last_reply_at',
            'good', 'top', 'reply_count', 'visit_count', 'create_at', 'author', 'image']);

        if (mdrender) {
            topic.content = renderHelper.markdown(at.linkUsers(topic.content));
        }
        topic.author = _.pick(author, ['loginname', 'avatar_url']);

        topic.replies = replies.map(function (reply) {
            if (mdrender) {
                reply.content = renderHelper.markdown(at.linkUsers(reply.content));
            }
            reply.author = _.pick(reply.author, ['loginname', 'avatar_url']);
            reply = _.pick(reply, ['id', 'author', 'content', 'ups', 'create_at', 'reply_id']);
            reply.reply_id = reply.reply_id || null;

            if (reply.ups && req.user && reply.ups.indexOf(req.user.id) != -1) {
                reply.is_uped = true;
            } else {
                reply.is_uped = false;
            }

            return reply;
        });

        ep.emit('full_topic', topic);
    }));


    if (!req.user) {
        ep.emitLater('is_collect', null);
    } else {
        TopicCollect.getTopicCollect(req.user._id, topicId, ep.done('is_collect'));
    }

    ep.all('full_topic', 'is_collect', function (full_topic, is_collect) {
        full_topic.is_collect = !!is_collect;

        res.send({success: true, data: full_topic});
    });

};

exports.show = show;

/**
 * TODO 创建 topic 时可以选择管理员维护的 area，在列表和详细信息查看中加入 area 标签显示
 * TODO 创建 topic 时可以发布到不同的 team 中，在列表和详细信息查看中加入 team 的标签显示
 * DONE (hhdem) 创建 topic 时可以关联已发布的图片
 * TODO 微信小程序记录轨迹
 */
var create = function (req, res, next) {
    var title = validator.trim(req.body.title || '');
    var forum = validator.trim(req.body.forum);
    var content = validator.trim(req.body.content || '');

    // 验证
    var editError;
    if (title === '') {
        editError = '标题不能为空';
    } else if (title.length < 5 || title.length > 100) {
        editError = '标题字数太多或太少';
    } else if (!forum) {
        editError = '必须选择一个版块';
    } else if (content === '') {
        editError = '内容不可为空';
    }
    // END 验证

    if (editError) {
        res.status(400);
        return res.send({success: false, error_msg: editError});
    }
    var client_info = tools.client_info(req);
    TopicProxy.newAndSave(title, content, forum, req.user.id, client_info, function (err, topic) {
        if (err) {
            return next(err);
        }

        var proxy = new EventProxy();
        proxy.fail(next);

        proxy.all('score_saved', function () {
            res.send({
                success: true,
                topic_id: topic.id
            });
        });
        UserProxy.getUserById(req.user.id, proxy.done(function (user) {
            user.score += 5;
            user.topic_count += 1;
            user.save();
            req.user = user;
            proxy.emit('score_saved');
        }));

        //发送at消息
        at.sendMessageToMentionUsers(content, topic.id, req.user.id);
    });
};

exports.create = create;
exports.update = function (req, res, next) {
    var topic_id = _.trim(req.body.topic_id);
    var title = _.trim(req.body.title);
    var forum = _.trim(req.body.forum);
    var content = _.trim(req.body.content);

    TopicProxy.getTopicById(topic_id, function (err, topic, tags) {
        if (!topic) {
            res.status(400);
            return res.send({success: false, error_msg: '此话题不存在或已被删除。'});
        }

        if (topic.author.equals(req.user._id) || req.user.is_admin) {
            // 验证
            var editError;
            if (title === '') {
                editError = '标题不能是空的。';
            } else if (title.length < 5 || title.length > 100) {
                editError = '标题字数太多或太少。';
            } else if (!forum) {
                editError = '必须选择一个版块。';
            }
            // END 验证

            if (editError) {
                return res.send({success: false, error_msg: editError});
            }

            //保存话题
            topic.title = title;
            topic.content = content;
            topic.forum = forum;
            topic.update_at = new Date();

            topic.save(function (err) {
                if (err) {
                    return next(err);
                }
                //发送at消息
                at.sendMessageToMentionUsers(content, topic._id, req.user._id);

                res.send({
                    success: true,
                    topic_id: topic.id
                });
            });
        } else {
            res.status(403);
            return res.send({success: false, error_msg: '对不起，你不能编辑此话题。'});
        }
    });
};
