var Forum        = require('../proxy').Forum;
var _            = require('lodash');

// DONE (hhdem) Forum信息添加和修改
exports.create = function (req, res, next) {
    req.checkBody({
        'title': {
            notEmpty: {
                options: [true],
                errorMessage: '板块名称不能为空'
            }
        },
        'type': {
            notEmpty: {
                options: [true],
                errorMessage: 'type 不能为空'
            },
            matches: {
                options: ['public|private|internal'],
                errorMessage: 'type 必须为 public,private,internal'
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
        let data = _.pick(req.body, ['id', 'title', 'content', 'path_name', 'type', 'order', 'bannerImage', 'css_text', 'js_text', 'template', 'managers', 'members']);
        data.user_id = req.session.user._id;
        if (!!data.id) {
            // 修改
            Forum.getForum(data.id, function(err, forum) {
                if (err) {
                    return next(err);
                }
                forum.title = data.title;
                forum.content = data.content;
                forum.path_name = data.path_name;
                forum.type = data.type;
                forum.order = data.order;
                forum.template = data.template;
                forum.bannerImage = data.bannerImage;
                forum.css_text = data.css_text;
                forum.js_text = data.js_text;
                forum.managers = data.managers;
                forum.members = data.members;
                forum.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/admin/forums');
                });
            });
        } else {
            // 新增
            Forum.newAndSave(data, function (err, forum) {
                if (err) {
                    return next(err);
                }
                res.redirect('/admin/forums');
            });
        }
    });
};

// DONE (hhdem) Forum信息查看
exports.show = function (req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: {
                options: [true],
                errorMessage: '板块名称不能为空'
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
        Forum.getFullForum(id, function (err, msg, forum, topics) {
            if (!!err) {
                return next (err);
            }
            if (!forum) {
                res.status(404);
                return res.send({success: false, error_msg: '板块不存在'});
            }
            if (!!msg) {
                res.status(404);
                return res.send({success: false, error_msg: msg});
            }
            forum.topics = topics;
            res.send({success: true, data: forum});
        });
    });
};

// TODO Forum信息删除
exports.delete = function (req, res, next) {
    res.render('static/function_building', {
        title: 'Forum信息删除'
    });
};