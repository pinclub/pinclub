var _ = require('lodash');
var TopicProxy = require('../../proxy').Topic;
var TopicLike = require('../../proxy').TopicLike;
var TopicBoard = require('../../proxy').TopicBoard;
var BoardProxy = require('../../proxy').Board;
var UserProxy = require('../../proxy').User;
var counter = require('../../common/counter');
var config = require('../../config');
var EventProxy = require('eventproxy');
var at = require('../../common/at');
var renderHelper = require('../../common/render_helper');
var structureHelper = require('../../common/structure_helper');
var validator = require('validator');

/**
 * @api {get} /v2/images 图片主题列表
 * @apiDescription
 * 获取本站图片主题列表
 * @apiName getImages
 * @apiGroup images
 *
 * @apiParam {Number} [page] 页数
 * @apiParam {Number} [limit] 每一页的主题数量
 *
 * @apiPermission none
 * @apiSampleRequest /v2/images
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
                  "author_id": "",
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
exports.index = function (req, res, next) {
    var type = 'image';
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;

    var limit = Number(req.query.limit) || config.list_topic_count;

    var query = {};
    query.deleted = false;
    query.type = type;
    var options = {skip: (page - 1) * limit, limit: limit, sort: '-top -last_reply_at'};

    var ep = new EventProxy();
    ep.fail(next);

    ep.all('topics', 'liked_topics', function (topics, liked_topics) {
        let liked_t_ids = _.map(liked_topics, 'topic');
        topics = topics.map(function (topic) {
            let structedTopic = structureHelper.image(topic);
            liked_t_ids.forEach(function(lti){
                let tid = lti.toString();
                if (topic.id === tid) {
                    structedTopic.liked = true;
                }
            });
            return structedTopic;
        });

        res.send({success: true, data: topics});
    });

    TopicProxy.getImagesByQuery(query, options, function (err, topics) {
        if (!!req.session.user) {
            // DONE (hhdem) 此处需要优化, 不要每次都获得全部喜欢的图片列表, 改为根据返回的图片列表, 查询是否like
            let topic_t_ids = _.map(topics, 'id');
            TopicLike.getTopicLikesByUserIdAndTopicIds(req.session.user._id, topic_t_ids, {}, ep.done('liked_topics'));
        } else {
            ep.emit('liked_topics', []);
        }
        ep.emit('topics', topics);
    });

};

/**
 *
 * @api {get} /v2/images/sim 相似图片列表
 * @apiDescription
 * 获取本站相似图片列表, 根据hamming距离算法计算.
 * @apiName simImages
 * @apiGroup images
 *
 * @apiParam {String} id 查询相似的图片id
 * @apiParam {String} sid 页数
 * @apiParam {Number} limit 要查询的图片数量
 *
 * @apiPermission none
 * @apiSampleRequest /v2/images/sim
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
exports.sim = function (req, res, next) {
    var limit = parseInt(req.query.limit, 10) || 3;
    if (!req.query.id) {
        return res.status(500).send({success: false, error_msg: "必要参数id未传."});
    }
    // 需从哪个id开始继续向下找
    if (!req.query.sid) {
        return res.status(500).send({success: false, error_msg: "必要参数sid未传."});
    }
    var topicId = req.query.id;
    var sId = req.query.sid;
    var ep = new EventProxy();
    ep.fail(next);

    TopicProxy.getTopicById(topicId, function (err, topic) {
        if (err) {
            return next(err);
        }
        if (!topic) {
            res.status(404);
            return res.send({success: false, error_msg: '图片不存在'});
        }
        var options = {limit: limit, sort: '-_id'};
        // DONE (hhdem) 考虑如何把 hamming 距离改成 SIFT 算法或 pHash 算法, 最终改了 gHash, 依然需要优化
        TopicProxy.getTopicsByQuery({type:'image', _id:{$lt:sId}, $where: "hammingDistance(this.image_hash, '" + topic.image_hash + "') < 25"}, options, function (err, topics) {
            if (err) {
                return next(err);
            }
            topics = topics.map(function (topic) {
                return structureHelper.image(topic);
            });
            res.send({success: true, data: topics});
        });

    });
};

/**
 * @api {post} /v2/images/like 喜欢图片
 * @apiDescription
 * 喜欢某图片
 * @apiName likeImage
 * @apiGroup images
 *
 * @apiUse ApiHeaderType
 * @apiParam {String} id 要喜欢的图片id
 *
 * @apiPermission none
 * @apiSampleRequest /v2/images/like
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
exports.like = function (req, res, next) {
    if (!req.body.id) {
        return res.status(500).send({success: false, error_msg: "必要参数id未传."});
    }

    var ep = new EventProxy();
    ep.fail(next);
    var topicId = req.body.id;
    var currentUser = req.session.user;
    TopicProxy.getTopicById(topicId, function (err, topic) {
        if (err) {
            return next(err);
        }
        if (!topic) {
            res.status(404);
            return res.send({success: false, error_msg: '图片不存在'});
        }
        TopicLike.getTopicLike(currentUser.id, topic._id, function (err, doc) {
            if (err) {
                return next(err);
            }
            if (doc) {
                return ep.emit('unlike_topic', topic);
                //res.json({success: false});
                //return;
            }
            return ep.emit('like_topic', topic);
            //TopicLike.newAndSave(currentUser.id, topic._id, function (err) {
            //    if (err) {
            //        return next(err);
            //    }
            //    res.json({success: true});
            //});
            //UserProxy.getUserById(currentUser.id, function (err, user) {
            //    if (err) {
            //        return next(err);
            //    }
            //    user.like_image_count += 1;
            //    user.save();
            //});
            //
            //topic.like_count += 1;
            //topic.save();
        });

    });

    ep.on('like_topic', function(topic) {
        TopicLike.newAndSave(currentUser.id, topic._id, function (err) {
            if (err) {
                return next(err);
            }
            res.json({success: true});
        });
        UserProxy.getUserById(currentUser.id, function (err, user) {
            if (err) {
                return next(err);
            }
            user.like_image_count += 1;
            req.session.user.like_image_count += 1;
            user.save();
        });

        counter.topic(topic, 'like', function (err, image) {
            if (err) {
                return next(err);
            }
        });
    });

    ep.on('unlike_topic', function(topic) {
        TopicLike.remove(currentUser.id, topic._id, function (err, removeResult) {
            if (err) {
                return next(err);
            }
            if (removeResult.result.n === 0) {
                return res.json({success: false});
            }

            UserProxy.getUserById(currentUser.id, function (err, user) {
                if (err) {
                    return next(err);
                }
                user.like_image_count -= 1;
                req.session.user.like_image_count -= 1;
                user.save();
            });
            counter.topic(topic, 'unlike', function (err, image) {
                if (err) {
                    return next(err);
                }
                res.json({success: true});
            });
        });
    });

};

/**
 *
 * DONE (hhdem) 修改为每次GET操作都生成新的topic对象, 但是图片地址不改变, 目前是添加了一个 TopicBoard 的关系对象
 * 把图片Get到自己的board中
 * @api {post} /v2/images/get Get图片
 * @apiDescription
 * Get某图片
 * @apiName getImage
 * @apiGroup images
 *
 * @apiUse ApiHeaderType
 * @apiParam {String} topic_id 要 Get 的图片 id
 * @apiParam {String} board_id 放入 Board 的 id
 * @apiParam {String} [desc] 描述
 * @apiParam {String[]} [tags] 标签
 *
 * @apiPermission none
 * @apiSampleRequest /v2/images/get
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
exports.getImage = function (req, res, next) {
    req.checkBody({
        'topic_id': {
            notEmpty: {
                options: [true],
                errorMessage: 'topic_id 不能为空'
            }
        },
        'board_id': {
            notEmpty: {
                options: [true],
                errorMessage: 'board_id 不能为空'
            }
        }
    });
    var ep = new EventProxy();
    var topic_id = req.body.topic_id;
    var board_id = req.body.board_id;
    var desc = req.body.desc;
    var currentUser = req.session.user;
    if (req.validationErrors()) {
        return res.status(400).json({success: false, err_message: '参数验证失败', err: req.validationErrors()}).end();
    }

    // 获得要Get的topic对象
    TopicProxy.getTopicById(topic_id, function (err, topic) {
        // DONE(hhdem) 增加 err 的错误校验, 返回对应的错误信息
        if (err) {
            return next(err);
        }
        topic.geted_count += 1;
        topic.save();
        ep.emit('topic_from', topic);
    });
    // 获得Get目标Board对象
    BoardProxy.getBoardById(board_id, function (err, board) {
        if (err) {
            return next(err);
        }
        board.topic_count += 1;
        board.save();
        ep.emit('board_to', board);
    });
    // 生成新的topic对象
    ep.on('topic_from', function(fromTopic) {
        var topicImage = _.pick(fromTopic, structureHelper.image_copy_fields);
        topicImage.title = desc;
        topicImage.author_id = currentUser;
        topicImage.get_from_topic = fromTopic._id;
        topicImage.board = board_id;
        TopicProxy.newAndSaveImage(topicImage, function (err, image) {
            if (err) {
                return next(err);
            }
            topicImage.id = image.id;
            ep.emit('new_topic_saved', topicImage);
        });
    });
    // 生成topicBoard关联对象
    ep.all('new_topic_saved', 'board_to', function(newImage, board) {
        TopicBoard.newAndSave(currentUser.id, newImage.id, board_id, desc || null, null, function (err, topicBoard) {
            if (err) {
                return next(err);
            }
            newImage.board = board;
            ep.emit('new_topic_board_saved', newImage);
            //res.json({success: true});
        });
    });
    // 更新统计数据
    UserProxy.getUserById(currentUser.id, function (err, user) {
        // DONE (hhdem) 增加 err 的错误校验, 返回对应的错误信息
        if (err) {
            return next(err);
        }
        user.get_image_count += 1;
        user.save();
        req.session.user.get_image_count += 1;
        ep.emit('user_count');
    });

    counter.topic(topic_id, 'getted', function (err, image) {
        if (err) {
            return next(err);
        }
        ep.emit('topic_count', image);
    });

    // TopicProxy.getTopicById(topic_id, function (err, topic) {
    //     // DONE (hhdem) 增加 err 的错误校验, 返回对应的错误信息
    //     if (err) {
    //         return next(err);
    //     }
    //     topic.geted_count += 1;
    //     topic.save();
    //     ep.emit('topic_count', topic);
    // });
    // 返回处理结果
    ep.all('new_topic_board_saved', 'user_count', 'topic_count', function(newImage){
        newImage.author = currentUser;
        res.send({
            success: true,
            data: newImage
        });
    });

};

/**
 * DONE (hhdem) 增加Board信息的返回,以及统计信息
 * @api {get} /v2/images/:id 显示图片信息
 * @apiDescription
 * 获取某图片信息
 * @apiName showImage
 * @apiGroup images
 *
 * @apiParam {String} id 要获取的图片 id
 *
 * @apiPermission none
 * @apiSampleRequest /v2/images/:id
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
exports.show = function (req, res, next) {
    var topicId = String(req.params.id);

    var mdrender = req.query.mdrender === 'false' ? false : true;
    var ep = new EventProxy();

    if (!validator.isMongoId(topicId)) {
        res.status(400);
        return res.send({success: false, error_msg: '不是有效的话题id'});
    }

    ep.all('full_topic', 'boardImages', 'liked_topics', 'like_users', function (full_topic, boardImages, liked_topics, like_users) {

        full_topic.board.images = boardImages;

        full_topic = structureHelper.image(full_topic);
        full_topic.liked = false;
        let liked_users = _.map(like_users, 'user');
        full_topic.like_users = liked_users;
        if (!!liked_topics && _.isArray(liked_topics)) {
            full_topic.liked = liked_topics.length > 0;
        }
        if (!!full_topic.image && full_topic.image.lastIndexOf('.') < 0) {
            full_topic.image_fixed = full_topic.image + config.qn_access.style[2];
        }
        res.send({success: true, data: full_topic});
    });

    TopicProxy.getFullImage(topicId, ep.done(function (msg, topic, replies) {
        if (!topic) {
            res.status(404);
            return res.send({success: false, error_msg: '话题不存在'});
        }
        if (!!msg) {
            res.status(404);
            return res.send({success: false, error_msg: msg});
        }

        TopicProxy.getTopicsByBoardId(topic.board._id, ep.done('boardImages'));

        topic.replies = replies.map(function (reply) {
            if (mdrender) {
                reply.content = renderHelper.markdown(at.linkUsers(reply.content));
            }
            reply = structureHelper.reply(reply);
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

    if (!req.session.user) {
        ep.emit('liked_topics', []);
    } else {
        TopicLike.getTopicLikesByUserIdAndTopicIds(req.session.user._id, [topicId], {}, ep.done('liked_topics'));
    }

    TopicLike.getLikeUsers(topicId, ep.done('like_users'));

    ep.fail(function(err){
        console.error(err);
    });

};