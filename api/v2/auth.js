var EventProxy   = require('eventproxy');
var jwt          = require('jsonwebtoken');
var UserModel   = require('../../models').User;
var UserProxy    = require('../../proxy').User;
var authMiddleWare = require('../../middlewares/auth');
var tools        = require('../../common/tools');
var config       = require('../../config');
var structureHelper = require('../../common/structure_helper');

/**
 * @api {post} /v2/auth/signin 登录
 * @apiDescription
 * API登录接口 获得 accessToken 信息
 * @apiName authSignin
 * @apiGroup auth
 *
 * @apiParam {String} loginname
 * @apiParam {String} password
 *
 * @apiPermission none
 * @apiSampleRequest /v2/auth/signin
 *
 * @apiVersion 2.0.0
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 */
exports.signIn = function (req, res, next) {
    req.checkBody({
        'loginname': {
            notEmpty: {
                options: [true],
                errorMessage: 'loginname 不能为空'
            }
        },
        'password': {
            notEmpty: {
                options: [true],
                errorMessage: 'password 不能为空'
            },
            isLength: {
                options: [6],
                errorMessage: 'password 不能小于 6 位'
            }
        }
    });

    var ep = new EventProxy();
    var loginname = req.body.loginname;
    var password = req.body.password;

    if (!!loginname && loginname.indexOf('@') !== -1) {
        req.assert('loginname', '不是有效的 Email 地址').isEmail();
    }
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            return res.status(400).json({success: false, err_message: '参数验证失败', err: result.useFirstErrorOnly().mapped()}).end();
        }
        ep.on('login_error', function (login_error) {
            return res.status(403).json({success: false, err_message: '调用登录接口失败', err: login_error}).end();
        });

        ep.on('login_success', function (user) {
            return res.status(200).json({success: true, accessToken: user.accessToken, user: structureHelper.user(user)});
        });

        ep.on('generate_token', function(user){
            let accessToken = jwt.sign({
                loginname: user.loginname,
                _id: user._id
            }, config.jwt_token, {expiresIn: 3600});
            UserModel.findOneAndUpdate({_id: user._id}, {'accessToken': accessToken}, {upsert: true}, function (err, user) { // , 'tokenExpires': tokenExp
                if (err) {
                    return ep.emit('login_error', '保存token出错');
                }
                user.accessToken = accessToken;
                ep.emit('login_success', user);
            });
        });

        ep.fail(next);

        var getUser;
        if (loginname.indexOf('@') !== -1) {
            getUser = UserProxy.getUserByMail;
        } else {
            getUser = UserProxy.getUserByLoginName;
        }

        getUser(loginname, function (err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return ep.emit('login_error');
            }
            var passhash = user.pass;
            tools.bcompare(password, passhash, ep.done(function (bool) {
                if (!bool) {
                    return ep.emit('login_error');
                }
                if (!user.active) {
                    // DONE (hhdem) 提醒激活不然无法继续进行下一步操作
                    return ep.emit('login_error', '没有激活, 无法通过api登录');
                }
                // store session cookie
                authMiddleWare.gen_session(user, res);

                if (!!user.accessToken) {
                    // 如果没有token 则生成 token
                    jwt.verify(user.accessToken, config.jwt_token, function (err, decoded) {
                        if (err) {
                            if (err.name === 'TokenExpiredError') {
                                return ep.emit('generate_token', user);
                            }
                            return ep.emit('login_error', '对已存在token做校验时报错');
                        }
                        ep.emit('login_success', user);
                    });
                } else {
                    ep.emit('generate_token', user);
                }


            }));
        });
    });


};
