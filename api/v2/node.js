var _ = require('lodash');
var NodeProxy = require('../../proxy').Node;
var EventProxy = require('eventproxy');

/**
 * @api {get} /v2/nodes 获得Node列表
 * @apiDescription
 * 获取 Node 列表
 * @apiName getNodes
 * @apiGroup node
 *
 * @apiUse ApiHeaderType
 * @apiParam {String} q 查询关键词
 *
 * @apiPermission none
 * @apiSampleRequest /v2/nodes
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
            name: {'$regex': qs}
        };
        NodeProxy.getNodesByQuery(query, {}, function (err, nodes) {
            if (err) {
                return next(err);
            }
            res.send({success: true, data: nodes});
        });
    });
};

exports.index = index;