var should = require('should');
var path = require('path');
var app = require('../../app');
var request = require('supertest')(app);
var support = require('../support/support');
var mm = require('mm');
var store = require('../../common/store');
var pedding = require('pedding');

describe('test/controllers/image.test.js', function () {

    var imagePath, mockUser, mockBoard, mockImage;
    before(function (done) {
        imagePath = path.join(__dirname, '/test.JPG');
        support.createUser(function (err, user) {
            mockUser = user;
            support.createBoard(user.id, '', function (err, board) {
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

    afterEach(function () {
        mm.restore();
    });

    describe('#upload', function () {
        it('should not upload a file without board filed', function (done) {
            mm(store, 'upload', function (file, options, callback) {
                callback(null, {
                    url: 'upload_success_url.JPG'
                });
            });
            request.post('/imageupload')
                .attach('test.JPG', imagePath)
                .set('Cookie', support.normalUser2Cookie)
                .end(function (err, res) {
                    res.body.should.eql({"success": false, "msg": "未选择对应的Board"});
                    done(err);
                });
        });

        it('should create new Image Object after uploaded a file', function (done) {
            mm(store, 'upload', function (file, options, callback) {
                callback(null, {
                    url: 'upload_success_url.JPG'
                });
            });
            request.post('/imageupload')
                .field('desc', 'image desc')
                .field('board', mockBoard.id)
                .attach('test.JPG', imagePath)
                .set('Cookie', support.normalUser2Cookie)
                .end(function (err, res) {
                    res.body.success.should.true();
                    res.text.should.containEql('I am board');
                    res.text.should.containEql('_86');
                    res.text.should.containEql('_430');
                    res.text.should.containEql('_fixed');
                    done(err);
                });
        });

        // TODO 增加 Image 图片上传测试用例: 上传后计数统计是否正确
        // TODO 增加 Image 图片上传测试用例: 上传后 hash 值是否正确

    });

    describe('#delete', function () {
        var wouldBeDeleteImage;
        before(function (done) {
            support.createImage(support.normalUser._id, mockBoard, function (err, image) {
                wouldBeDeleteImage = image;
                done(err);
            });
        });

        it('should not delete a image when not author', function (done) {
            request.post('/image/' + wouldBeDeleteImage._id + '/delete')
                .set('Cookie', support.normalUser2Cookie)
                .expect(403, function (err, res) {
                    res.body.should.eql({success: false, message: '无权限'});
                    done(err);
                });
        });

        it('should delele a image', function (done) {
            request.post('/image/' + wouldBeDeleteImage._id + '/delete')
                .set('Cookie', support.normalUserCookie)
                .expect(200, function (err, res) {
                    res.body.should.eql({ success: true, message: '话题已被删除。' });
                    done(err);
                });
        });
    });

    describe('#top', function () {
        it('should top a image', function (done) {
            request.post('/image/' + support.testTopic._id + '/top')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('此话题已置顶。');
                    done(err);
                });
        });

        it('should untop a image', function (done) {
            request.post('/image/' + support.testTopic._id + '/top')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('此话题已取消置顶');
                    done(err);
                });
        });
    });

    describe('#good', function () {
        it('should good a image', function (done) {
            request.post('/image/' + support.testTopic._id + '/good')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('此话题已加精。');
                    done(err);
                });
        });

        it('should ungood a image', function (done) {
            request.post('/image/' + support.testTopic._id + '/good')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('此话题已取消加精。');
                    done(err);
                });
        });
    });

    describe('#collect', function () {
        it('should collect a image', function (done) {
            request.post('/image/collect')
                .send({
                    image_id: support.testTopic._id,
                })
                .set('Cookie', support.normalUser2Cookie)
                .expect(200, function (err, res) {
                    res.body.should.eql({status: 'success'});
                    done(err);
                })
        });

        it('should not collect a image twice', function (done) {
            request.post('/image/collect')
                .send({
                    image_id: support.testTopic._id,
                })
                .set('Cookie', support.normalUser2Cookie)
                .expect(200, function (err, res) {
                    res.body.should.eql({status: 'failed'});
                    done(err);
                })
        })
    })

    describe('#de_collect', function () {
        it('should decollect a image', function (done) {
            request.post('/image/de_collect')
                .send({
                    image_id: support.testTopic._id,
                })
                .set('Cookie', support.normalUser2Cookie)
                .expect(200, function (err, res) {
                    res.body.should.eql({status: 'success'});
                    done(err);
                });
        });

        it('should not decollect a non-exist topic_collect', function (done) {
            request.post('/image/de_collect')
                .send({
                    image_id: support.testTopic._id,
                })
                .set('Cookie', support.normalUser2Cookie)
                .expect(200, function (err, res) {
                    res.body.should.eql({status: 'failed'});
                    done(err);
                });
        });
    });

    describe('#lock', function () {
        it('should lock a image', function (done) {
            request.post('/image/' + support.testTopic._id + '/lock')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('此话题已锁定。');
                    done(err);
                });
        });

        it('should not reply a locked image', function (done) {
            var topic = support.testTopic;
            request.post('/' + topic._id + '/reply')
                .set('Cookie', support.normalUserCookie)
                .send({
                    r_content: 'test reply 1'
                })
                .expect(403)
                .end(function (err, res) {
                    res.text.should.equal('此主题已锁定。');
                    done(err);
                });
        });

        it('should unlock a image', function (done) {
            request.post('/image/' + support.testTopic._id + '/lock')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('此话题已取消锁定。');
                    done(err);
                });
        });

        it('should reply a unlocked image', function (done) {
            var topic = support.testTopic;
            request.post('/' + topic._id + '/reply')
                .set('Cookie', support.normalUserCookie)
                .send({
                    r_content: 'test reply 1'
                })
                .expect(302)
                .end(function (err, res) {
                    done(err);
                });
        });
    });
});
