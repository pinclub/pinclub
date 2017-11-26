var app = require('../../../app');
var request = require('supertest')(app);
var should = require('should');
var jwt          = require('jsonwebtoken');
var support = require('../../support/support');
var config = require('../../../config');

describe('test/api/v2/auth.test.js', function () {
    var mockUser;

    before(function (done) {
        support.createUser(function (err, user) {
            let accessToken = jwt.sign({
                loginname: user.loginname,
                _id: user._id
            }, config.jwt_token, {expiresIn: 1});
            user.active = true;
            user.accessToken = accessToken;
            user.save();
            mockUser = user;
            done();
        });
    });

    describe('post /api/v2/auth/signin', function () {

        it('should signin success with email and password', function (done) {
            request.post('/api/v2/auth/signin')
                .send({
                    loginname: support.activedUser.email,
                    password: 'password'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.text.should.containEql('accessToken');
                    done();
                });
        });

        it('should signin success with loginname and password and empty accessToken', function (done) {
            request.post('/api/v2/auth/signin')
                .send({
                    loginname: support.activedUser.loginname,
                    password: 'password'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.text.should.containEql('accessToken');
                    done();
                });
        });

        it('should not signin when email is invalid', function (done) {
            request.post('/api/v2/auth/signin')
                .send({
                    loginname: 'login@name',
                    password: 'password'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.err_message.should.equal('参数验证失败');
                    res.text.should.containEql('不是有效的 Email 地址');
                    done();
                });
        });

        it('should not signin when account are not actived', function (done) {
            request.post('/api/v2/auth/signin')
                .send({
                    loginname: support.normalUser.loginname,
                    password: 'password'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.err_message.should.equal('没有激活, 无法通过api登录');
                    res.text.should.containEql('没有激活, 无法通过api登录');
                    done();
                });
        });

        it('should not signin whit short password', function (done) {
            request.post('/api/v2/auth/signin')
                .send({
                    loginname: support.normalUser2.loginname,
                    password: 'pass'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.err_message.should.equal('参数验证失败');
                    res.text.should.containEql('password 不能小于 6 位');
                    done();
                });
        });

        it('should not signin with wrong password', function (done) {
            request.post('/api/v2/auth/signin')
                .send({
                    loginname: support.normalUser2.loginname,
                    password: 'wrong pass'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.err_message.should.equal('用户不存在或密码不匹配');
                    done();
                });
        });

        it('should not signin with empty loginname', function (done) {
            request.post('/api/v2/auth/signin')
                .send({
                    password: 'pass'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.err_message.should.equal('参数验证失败');
                    done();
                });
        });

        it('should signin with new accessToken when old accessToken is expired', function (done) {
            request.post('/api/v2/auth/signin')
                .send({
                    loginname: mockUser.loginname,
                    password: 'password'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.accessToken.should.not.equal(mockUser.accessToken);
                    done();
                });
        });
    });

});
