var app = require('../../../app');
var path = require('path');
var request = require('supertest')(app);
var should = require('should');
var support = require('../../support/support');
var mm = require('mm');
var store = require('../../../common/store');

describe('test/api/v2/image.test.js', function () {
    var mockBoard, mockUser, mockImage, simImagePath1, simImagePath2;

    before(function (done) {
        simImagePath1 = path.join(__dirname, '/sim1.JPG');
        simImagePath2 = path.join(__dirname, '/sim2.JPG');
        support.createUser(function (err, user) {
            mockUser = user;
            support.createBoard(user.id, 'public', function (err, board) {
                mockBoard = board;
                support.createImage(user.id, board, function (err, image) {
                    mockImage = image;
                    support.createReply(image.id, user.id, function (err, reply) {
                        support.createSingleUp(reply.id, user.id, function (err, reply) {
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('get /api/v2/images', function () {
        it('should return images', function (done) {
            request.get('/api/v2/images')
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data.length.should.above(0);
                    done();
                });
        });

        it('should return images with limit 2', function (done) {
            request.get('/api/v2/images')
                .query({
                    limit: 2
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data.length.should.equal(2);
                    done();
                });
        });

        it('should return images when signed in', function (done) {
            request.get('/api/v2/images')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data.length.should.be.above(0);
                    done();
                });
        });
    });

    describe('get /api/v2/images/sim', function () {
        it('should return false when not pass any params', function (done) {
            request.get('/api/v2/images/sim')
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    done();
                });
        });

        it('should return false when not pass ids', function (done) {
            request.get('/api/v2/images/sim')
                .query({
                    id: mockImage.id
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.text.should.containEql('必要参数sid未传.');
                    done();
                });
        });

        it('should return false when id does not exist', function (done) {
            request.get('/api/v2/images/sim')
                .query({
                    id: '58f095d2f080cf5643240900',
                    sid: mockImage.id
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.text.should.containEql('图片不存在');
                    done();
                });
        });

        // DONE (hhdem) 增加 Image 图片上传测试用例: 上传两张图片后, 进行 hamming 距离计算
        it('should return a image similar ', function (done) {
            mm(store, 'upload', function (file, options, callback) {
                callback(null, {
                    url: 'upload_success_url.JPG'
                });
            });
            request.post('/imageupload')
                .field('desc', 'image desc')
                .field('board', mockBoard.id)
                .attach('sim1.JPG', simImagePath1)
                .set('Cookie', support.normalUser2Cookie)
                .end(function (err, res) {
                    res.body.success.should.true();
                    var image = res.body.data[0];
                    request.post('/imageupload')
                        .field('desc', 'image desc')
                        .field('board', mockBoard.id)
                        .attach('sim2.JPG', simImagePath2)
                        .set('Cookie', support.normalUser2Cookie)
                        .end(function (err, res) {
                            res.body.success.should.true();
                            var imageFound = res.body.data[0];
                            request.get('/api/v2/images/sim')
                                .query({
                                    id: imageFound.id,
                                    sid: imageFound.id,
                                    limit: 3
                                })
                                .end(function (err, res) {
                                    should.not.exists(err);
                                    res.body.success.should.true();
                                    console.log(imageFound.id);
                                    console.log(res.text);
                                    res.text.should.containEql(image.id);
                                    done();
                                });

                        });
                });
        });


    });

    describe('post /api/v2/images/like', function () {
        it('should return false when user not login', function (done) {
            request.post('/api/v2/images/like')
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.text.should.containEql('无权限操作, 请确定是否登录或token是否正确');
                    done();
                });
        });

        it('should return false when id does not exist', function (done) {
            request.post('/api/v2/images/like')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.text.should.containEql('必要参数id未传.');
                    done();
                });
        });

        it('should return false when id does not exist', function (done) {
            request.post('/api/v2/images/like')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .send({
                    id: '58f095d2f080cf5643240900'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.text.should.containEql('图片不存在');
                    done();
                });
        });

        it('should success like an image', function (done) {
            request.post('/api/v2/images/like')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .send({
                    id: mockImage.id
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    done();
                });
        });

        it('should success unlike an image', function (done) {
            request.post('/api/v2/images/like')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .send({
                    id: mockImage.id
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    request.post('/api/v2/images/like')
                        .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                        .send({
                            id: mockImage.id
                        })
                        .end(function (err, res) {
                            should.not.exists(err);
                            res.body.success.should.true();
                            done();
                        });
                });
        });
    });

    describe('get /api/v2/images/:id', function () {
        it('should return false when send an error id', function (done) {
            request.get('/api/v2/images/aaaadsafsadf')
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.text.should.containEql('不是有效的话题id');
                    done();
                });
        });

        it('should return flase when topic id does not exists', function (done) {
            request.get('/api/v2/images/58f095d2f080cf5643240900')
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.text.should.containEql('话题不存在');
                    done();
                });
        });

        it('should return success with right id', function (done) {
            request.get('/api/v2/images/' + mockImage.id)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.text.should.containEql(mockImage.title);
                    res.text.should.containEql(mockImage.content);
                    done();
                });
        });

    });

    describe('post /api/v2/images/get', function () {
        var wouldBeGetToBoard;
        before(function (done) {
            support.createBoard(support.normalUser.id, 'public', function (err, board) {
                wouldBeGetToBoard = board;
                done();
            });
        });
        it('should return false if not send topic_id', function (done) {
            request.post('/api/v2/images/get')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.text.should.containEql('topic_id 不能为空');
                    res.text.should.containEql('参数验证失败');
                    done();
                });
        });
        it('should return false if not send board_id', function (done) {
            request.post('/api/v2/images/get')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .send({
                    topic_id: 'xxxxx'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.text.should.containEql('board_id 不能为空');
                    res.text.should.containEql('参数验证失败');
                    done();
                });
        });

        it('should return true after get an image', function (done) {
            request.post('/api/v2/images/get')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .send({
                    topic_id: mockImage.id,
                    board_id: wouldBeGetToBoard.id,
                    desc: 'get image desc'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.text.should.containEql('get image desc');
                    done();
                });
        });

    });

});
