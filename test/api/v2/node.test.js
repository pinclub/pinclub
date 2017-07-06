var app = require('../../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../../support/support');

var config = require('../../../config');
var jwt = require('jsonwebtoken');

describe('test/api/v2/node.test.js', function () {
    var mockUser, mockImage, mockBoard;

    before(function (done) {
        support.createUser(function (err, user) {
            mockUser = user;
            support.createBoard('new node title', user.id, 'public', function (err, node) {
                mockBoard = node;
                support.createImage(user.id, node, function (err, image) {
                    mockImage = image;
                    done();
                });
            });
        });
    });

    describe('get /api/v2/nodes', function () {
        it('should return nodes', function (done) {
            request.get('/api/v2/nodes')
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data.length.should.equal(1);
                    done();
                });
        });

        it('should return nodes length equal to 0', function (done) {
            request.get('/api/v2/nodes')
                .set('Authorization', 'Bearer ' + support.activedUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data.length.should.equal(0);
                    done();
                });
        });
    });

    describe('post /api/v2/nodes', function () {
        var expiredUser;
        var errorAccessToken;
        var blockUser;
        before(function (done) {
            support.createUser(function (err, user) {
                user.is_block = true;
                user.save(function(){
                    blockUser = user;
                    support.createUser(function (err, user) {
                        errorAccessToken = user.accessToken;
                        let accessToken = jwt.sign({
                            loginname: user.loginname,
                            _id: user._id
                        }, config.jwt_token, {expiresIn: 0});
                        user.accessToken = accessToken;
                        user.save(function(){
                            expiredUser = user;
                            done();
                        });

                    });
                });

            });

        });
        it('should return new node', function (done) {
            request.post('/api/v2/nodes')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .send({
                    title: 'new node'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.title.should.equal('new node');
                    done();
                });
        });

        it('should return error when create without title', function (done) {
            request.post('/api/v2/nodes')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.error_msg.should.equal('标题不能为空');
                    done();
                });
        });

        it('should not create node when accessToken is expired', function (done) {
            request.post('/api/v2/nodes')
                .set('Authorization', 'Bearer ' + expiredUser.accessToken)
                .send({
                    title: 'new node'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.error_msg.should.equal('您的Token已过期');
                    done();
                });
        });

        it('should not create node when accessToken is wrong', function (done) {
            request.post('/api/v2/nodes')
                .set('Authorization', 'Bearer ' + errorAccessToken)
                .send({
                    title: 'new node'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.error_msg.should.equal('错误的accessToken');
                    done();
                });
        });

        it('should not create node when account is locked', function (done) {

            request.post('/api/v2/nodes')
                .set('Authorization', 'Bearer ' + blockUser.accessToken)
                .send({
                    title: 'new node'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.error_msg.should.equal('您的账户被禁用');
                    done();
                });
        });
    });

    describe('get /api/v2/nodes/:id', function () {
        it('should show node info', function (done) {
            request.get('/api/v2/nodes/' + mockBoard.id)
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data._id.should.equal(mockBoard.id);
                    done();
                });
        });

        it('should not show node info and return not valid id', function (done) {
            request.get('/api/v2/nodes/' + mockUser.id)
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.error_msg.should.equal('Board不存在');
                    done();
                });
        });

        it('should show node info', function (done) {
            request.get('/api/v2/nodes/a' + mockBoard.id)
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.error_msg.should.equal('不是有效的Board id');
                    done();
                });
        });
    });
});
