var _ = require('lodash');
var ForumProxy = require('../../proxy').Forum;
var EventProxy = require('eventproxy');

/**
 * @api {get} /v2/forums 获得Forum列表
 * @apiDescription
 * 获取 Forum 列表
 * @apiName getForums
 * @apiGroup forum
 *
 * @apiUse ApiHeaderType
 * @apiParam {String} q 查询关键词
 *
 * @apiPermission none
 * @apiSampleRequest /v2/forums
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
var index = function (req, res, next) {
    req.checkQuery({
        'q': {
            notEmpty: {
                options: [true],
                errorMessage: 'q 不能为空'
            }
        }
    });
    var currentUser = req.session.user;
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
            title: {'$regex': qs}
        };
        query.type = 'public';
        if (!!currentUser) {
            query.type = {$ne: 'private'};
        }

        ForumProxy.getForumsByQuery(query, {}, function (err, forums) {
            if (err) {
                return next(err);
            }
            res.send({success: true, data: forums});
        });
    });
};

exports.index = index;