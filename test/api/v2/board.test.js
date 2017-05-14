var app = require('../../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../../support/support');

describe('test/api/v2/board.test.js', function () {
    var mockUser, mockImage;

    before(function (done) {
        support.createUser(function (err, user) {
            mockUser = user;
            support.createBoard(user.id, '', function (err, board) {
                support.createImage(user.id, board, function (err, image) {
                    mockImage = image;
                    done();
                });
            });
        });
    });

    describe('get /api/v2/boards', function () {
        it('should return boards', function (done) {
            request.get('/api/v2/boards')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data.length.should.equal(1);
                    done();
                });
        });

        it('should return boards length equal to 0', function (done) {
            request.get('/api/v2/boards')
                .set('Authorization', 'Bearer ' + support.activedUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data.length.should.equal(0);
                    done();
                });
        });
    });

    describe('post /api/v2/boards', function () {
        it('should return new board', function (done) {
            request.post('/api/v2/boards')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .send({
                    title: 'new board'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.title.should.equal('new board');
                    done();
                });
        });

        it('should return error when create without title', function (done) {
            request.post('/api/v2/boards')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.body.error_msg.should.equal('标题不能为空');
                    done();
                });
        });
    });
});
