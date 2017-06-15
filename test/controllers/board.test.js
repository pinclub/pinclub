var app = require('../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../support/support');

describe('test/controllers/board.test.js', function () {

    var mockBoard;

    before(function (done) {
        support.createBoard('new board title', support.normalUser2.id, 'public', function (err, board) {
            mockBoard = board;
            done(err);
        });
    });

    describe('create board', function () {
        it('should add a board', function (done) {
            request.post('/boards')
                .send({
                    title: 'Board title',
                    type: 'public'
                })
                .set('Cookie', support.normalUserCookie)
                .expect(302, function (err, res) {
                    res.headers.location.should.match(/^\/boards$/);
                    done(err);
                });
        });

        it('should not add board when params not right', function (done) {
            request.post('/boards')
                .send({
                    title: '',
                    type: 'not_valid_type'
                })
                .set('Cookie', support.adminUserCookie)
                .expect(400, function (err, res) {
                    res.body.success.should.false();
                    res.text.should.containEql('参数验证失败');
                    res.text.should.containEql('Board 名称不能为空');
                    res.text.should.containEql('type 必须为 public,private');
                    done(err);
                });
        });

        it('should not create a board when user not login', function (done) {
            request.post('/boards')
                .send({
                    title: '',
                    type: 'not_valid_type'
                })
                .expect(200, function (err, res) {
                    res.text.should.containEql('登录');
                    done(err);
                });
        });
    });

    describe('edit board', function () {
        it('should edit board successful', function (done) {
            request.post('/boards/' + support.testBoard.id + '/edit')
                .send({
                    title: 'new_title',
                    type: 'private'
                })
                .set('Cookie', support.adminUserCookie)
                .expect(302, function (err, res) {
                    res.headers.location.should.match(/^\/boards$/);
                    done(err);
                });
        });

        it('should not edit board when params not right', function (done) {
            done();
        });

        it('should not edit board when user not login', function (done) {
            done();
        });

        it('should not edit board if is not a creator', function (done) {
            done();
        });

        it('should update edit', function (done) {
            done();
        });
    });

    describe('delete board', function () {
        it('should not delete when not admin', function (done) {
            done();
        });

        it('should alert warning message when delete board that contain topics in it', function (done) {
            done();
        });

        it('should delete board when there are topic in it', function (done) {
            done();
        });

        it('should delete board', function (done) {
            done();
        });
    });

    describe('list board', function () {
        it('should list all boards', function (done) {
            request.get('/boards')
                .set('Cookie', support.normalUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql(support.testBoard.id);
                    done(err);
                });
        });
    });

    describe('show board', function () {
        it('should show correct info of board', function (done) {
            request.get('/boards/' + mockBoard.id)
                .expect(200, function (err, res) {
                    res.text.should.containEql(mockBoard.title);
                    done(err);
                });
        });

        it('should return error when try to get an unexist board', function (done) {
            request.get('/boards/' + support.adminUser.id)
                .set('Cookie', support.normalUser2Cookie)
                .expect(404, function (err, res) {
                    res.text.should.containEql('Board不存在');
                    done(err);
                });
        });
    });
});

