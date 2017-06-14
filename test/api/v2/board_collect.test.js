var app = require('../../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../../support/support');

describe('test/api/v2/board_collect.test.js', function () {

    var mockUser, mockBoard;

    before(function (done) {
        support.createUser(function (err, user) {
            mockUser = user;
            support.createBoard(user.id, 'public', function (err, board) {
                mockBoard = board;
                done();
            });
        });
    });

    // 主题被收藏之前
    describe('before collect board', function () {

        describe('get /boards/collect/:loginname', function () {

            it('should list boards with length = 0', function (done) {
                request.get('/api/v2/boards/collect/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.length.should.equal(0);
                        done();
                    });
            });

        });

    });

    // 收藏主题
    describe('post /boards/collect', function () {

        it('should 401 with no accessToken', function (done) {
            request.post('/api/v2/boards/collect')
                .send({
                    board_id: mockBoard.id
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.status.should.equal(401);
                    res.body.success.should.false();
                    done();
                });
        });

        it('should collect board with correct accessToken', function (done) {
            request.post('/api/v2/boards/collect')
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .send({
                    board_id: mockBoard.id
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    done();
                });
        });

        it('should not collect board twice', function (done) {
            request.post('/api/v2/boards/collect')
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .send({
                    board_id: mockBoard.id
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.error_msg.should.equal('You already collect this board.');
                    done();
                });
        });

        it('should fail when board_id is not valid', function (done) {
            request.post('/api/v2/boards/collect')
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .send({
                    board_id: mockBoard.id + "not_valid"
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.status.should.equal(500);
                    res.body.success.should.false();
                    res.body.error_msg.should.equal('不是有效的board_id');
                    done();
                });
        });

    });

    // 主题被收藏之后
    describe('after collect board', function () {

        describe('get /boards/collect/:loginname', function () {

            it('should list topic with length = 1', function (done) {
                request.get('/api/v2/boards/collect/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.length.should.equal(1);
                        res.body.data[0].id.should.equal(mockBoard.id);
                        done();
                    });
            });

            it('should fail when user not found', function (done) {
                request.get('/api/v2/boards/collect/' + mockUser.loginname + 'not_found')
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.status.should.equal(404);
                        res.body.success.should.false();
                        done();
                    });
            });

        });

    });

    // 取消收藏主题
    describe('post /boards/de_collect', function () {

        it('should 401 with no accessToken', function (done) {
            request.post('/api/v2/boards/de_collect')
                .send({
                    board_id: mockBoard.id
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.status.should.equal(401);
                    res.body.success.should.false();
                    done();
                });
        });

        it('should decollect boards with correct accessToken', function (done) {
            request.post('/api/v2/boards/de_collect')
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .send({
                    board_id: mockBoard.id
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    done();
                });
        });

        it('should not decollect boards twice', function (done) {
            request.post('/api/v2/boards/de_collect')
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .send({
                    board_id: mockBoard.id
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    done();
                });
        });

        it('should fail when board_id is not valid', function (done) {
            request.post('/api/v2/boards/de_collect')
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .send({
                    board_id: mockBoard.id + "not_valid"
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.status.should.equal(500);
                    res.body.success.should.false();
                    done();
                });
        });

        it('should fail when board not found', function (done) {
            var notFoundTopicId = mockBoard.id.split("").reverse().join("");
            request.post('/api/v2/boards/de_collect')
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .send({
                    board_id: notFoundTopicId
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    if (mockBoard.id === notFoundTopicId) { // 小概率事件id反转之后还不变
                        res.body.success.should.true();
                    } else {
                        res.status.should.equal(404);
                        res.body.success.should.false();
                    }
                    done();
                });
        });

    });

    // 主题被取消收藏之后
    describe('after decollect board', function () {

        describe('get /boards/collect/:loginname', function () {

            it('should list board with length = 0', function (done) {
                request.get('/api/v2/boards/collect/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.length.should.equal(0);
                        done();
                    });
            });

        });

    });

});
