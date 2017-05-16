var UserModel = require('../../models').User;
var EventProxy = require('eventproxy');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var config = require('../../config');

// 非登录用户直接屏蔽
var auth = function (req, res, next) {
    // JWT
    let bearerHeader = req.headers["authorization"];
    var ep = new EventProxy();
    ep.fail(next);
    // 使用 jwt 的形式做校验
    if (typeof bearerHeader !== 'undefined') {
        // authorization 中有用户信息
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];

        jwt.verify(bearerToken, config.jwt_token, function (err, decoded) {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.send({success: false, error_msg: '您的Token已过期'});
                }
                return res.send({success: false, error_msg: '登录出错'});
            }
            ep.emit('auth_success');
        });

        ep.on('auth_success', function() {
            UserModel.findOne({accessToken: bearerToken}, ep.done(function (user) {
                if (!user) {
                    res.status(401);
                    return res.send({success: false, error_msg: '错误的accessToken'});
                }
                if (user.is_block) {
                    res.status(403);
                    return res.send({success: false, error_msg: '您的账户被禁用'});
                }
                req.session.user = user;
                req.user = user;
                next();
            }));
        });
    } else if (req.session.user || req.user) {
        // session 中有用户信息
        next();
    } else {
        return res.status(401).send({success: false, error_msg: '无权限操作, 请确定是否登录或token是否正确. '});
    }
    // JWT End

    //var accessToken = String(req.body.accesstoken || req.query.accesstoken || '');
    //accessToken = validator.trim(accessToken);
    //
    //UserModel.findOne({accessToken: accessToken}, ep.done(function (user) {
    //    if (!user) {
    //        res.status(401);
    //        return res.send({success: false, error_msg: '错误的accessToken'});
    //    }
    //    if (user.is_block) {
    //        res.status(403);
    //        return res.send({success: false, error_msg: '您的账户被禁用'});
    //    }
    //    req.user = user;
    //    next();
    //}));

};

exports.auth = auth;

// 非登录用户也可通过
var tryAuth = function (req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);

    var accessToken = String(req.body.accesstoken || req.query.accesstoken || '');
    accessToken = validator.trim(accessToken);

    UserModel.findOne({accessToken: accessToken}, ep.done(function (user) {
        if (!user) {
            return next();
        }
        if (user.is_block) {
            res.status(403);
            return res.send({success: false, error_msg: '您的账户被禁用'});
        }
        req.user = user;
        next();
    }));

};

exports.tryAuth = tryAuth;
