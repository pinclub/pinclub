var Node        = require('../proxy').Node;
var _            = require('lodash');

// DONE (hhdem) 管理员创建节点
exports.create = function (req, res, next) {
    req.checkBody({
        'name': {
            notEmpty: {
                options: [true],
                errorMessage: '节点名称不能为空'
            }
        },
        'code': {
            notEmpty: {
                options: [true],
                errorMessage: '节点编码不能为空'
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
        let data = _.pick(req.body, ['id', 'name', 'code', 'content', 'parent']);
        data.creator = req.session.user._id;
        if (!!data.id) {
            // 修改
            Node.getNode(data.id, function(err, forum) {
                if (err) {
                    return next(err);
                }
                forum.name = data.name;
                forum.content = data.content;
                forum.code = data.code;
                forum.parent = data.parent;
                forum.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/admin/nodes');
                });
            });
        } else {
            // 新增
            Node.newAndSave(data, function (err, forum) {
                if (err) {
                    return next(err);
                }
                res.redirect('/admin/nodes');
            });
        }
    });
};

// DONE (hhdem) 查看节点信息
exports.show = function (req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: {
                options: [true],
                errorMessage: '节点id不能为空'
            },
            isMongoId: {errorMessage: 'id 需为 mongoId 对象'}
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
        var id = req.params.id;
        Node.getFullNode(id, function (err, msg, node) {
            if (!!err) {
                return next (err);
            }
            if (!node) {
                res.status(404);
                return res.send({success: false, error_msg: '节点不存在'});
            }
            if (!!msg) {
                res.status(500);
                return res.send({success: false, error_msg: msg});
            }
            res.send({success: true, data: node});
        });
    });
};