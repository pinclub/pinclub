var models = require('../../models');
var TopicModel = models.Topic;
var TopicProxy = require('../../proxy').Topic;
var TopicCollect = require('../../proxy').TopicCollect;
var UserProxy = require('../../proxy').User;
var UserModel = models.User;
var ReplyProxy = require('../../proxy').Reply;
var config = require('../../config');
var eventproxy = require('eventproxy');
var structureHelper = require('../../common/structure_helper');

/**
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
    if (!req.query.id) {
        return res.status(500).send({success: false, error_msg: "必要参数id未传."});
    }
    // 需从哪个id开始继续向下找
    if (!req.query.sid) {
        return res.status(500).send({success: false, error_msg: "必要参数sid未传."});
    }
    var limit = 3;
    if (req.query.limit && req.query.limit <= 10) {
        limit = req.query.limit;
    }
    var topicId = req.query.id;
    var sId = req.query.sid;
    var ep = new eventproxy();
    ep.fail(next);

    TopicProxy.getTopicById(topicId, function (err, topic, tags) {
        if (err) {
            return next(err);
        }
        if (!topic) {
            res.status(404);
            return res.send({success: false, error_msg: '话题不存在'});
        }
        var options = {limit: limit, sort: '-_id'};
        TopicProxy.getTopicsByQuery({type:'image', _id:{$lt:sId}, $where: "hammingDistance(this.image_hash, '" + topic.image_hash + "') < 20"}, options, ep.done('topics', function (topics) {
            return topics;
        }));

    });
    ep.all('topics', function (topics) {
        topics = topics.map(function (topic) {
            return structureHelper.topic(topic);
        });

        res.send({success: true, data: topics});
    });
};

exports.like = function (req, res, next) {

};