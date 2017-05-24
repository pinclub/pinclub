var app = require('../../app');
var counter = require('../../common/counter');
var support = require('../support/support');
var should = require('should');
var request = require('supertest')(app);
var should = require('should');

describe('test/common/counter.test.js', function () {

    var mockUser;
    var mockUserCookie;
    var wouldBeDeleteTopic;

    before(function (done) {
        support.createUser(function (err, user) {
            mockUser = user;
            mockUserCookie = support.mockUser(user);
            support.createTopic(mockUser._id, function (err, topic) {
                wouldBeDeleteTopic = topic;
                done(err);
            });
        });
    });
    describe('user counter', function () {

        it('should add score and topic_count', function (done) {
            counter.user(mockUser.id, 'topic', 'add', function (err, user) {
                should.not.exists(err);
                request.get('/api/v1/user/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.topic_count.should.equal(1);
                        res.body.data.score.should.equal(5);
                        done();
                    });
            });
        });

        it('should add score and topic_count after create topic with API', function (done) {
            // DONE (hhdem) 添加测试用例: 创建主题后增加用户积分和主题数
            request.post('/api/v1/topics')
                .send({
                    accesstoken: mockUser.accessToken,
                    title: '我是API测试标题',
                    tab: 'share',
                    content: '我是API测试内容'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.topic_id.should.be.String();
                    request.get('/api/v1/user/' + mockUser.loginname)
                        .end(function (err, res) {
                            should.not.exists(err);
                            res.body.success.should.true();
                            res.body.data.topic_count.should.equal(2);
                            res.body.data.score.should.equal(10);
                            done();
                        });
                });
        });

        it('should delete score and topic_count', function (done) {
            counter.user(mockUser.id, 'topic', 'sub', function (err, user) {
                should.not.exists(err);
                request.get('/api/v1/user/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.topic_count.should.equal(1);
                        res.body.data.score.should.equal(5);
                        done();
                    });
            });
        });

        it('should sub score and topic_count after delete topic with API', function (done) {
            // DONE (hhdem) 添加测试用例: 删除主题后减少用户积分和主题数
            request.post('/topic/' + wouldBeDeleteTopic._id + '/delete')
                .set('Cookie', mockUserCookie)
                .expect(200, function (err, res) {
                    res.body.should.eql({success: true, message: '话题已被删除。'});
                    request.get('/api/v1/user/' + mockUser.loginname)
                        .end(function (err, res) {
                            should.not.exists(err);
                            res.body.success.should.true();
                            res.body.data.topic_count.should.equal(0);
                            res.body.data.score.should.equal(0);
                            done();
                        });
                });
        });

        it('should add score and topic_count with user object', function (done) {
            counter.user(mockUser, 'topic', 'add', function (err, user) {
                should.not.exists(err);
                request.get('/api/v1/user/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.topic_count.should.equal(1);
                        res.body.data.score.should.equal(5);
                        done();
                    });
            });
        });

        it('should delete score and topic_count with user object', function (done) {
            counter.user(mockUser, 'topic', 'sub', function (err, user) {
                should.not.exists(err);
                request.get('/api/v1/user/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.topic_count.should.equal(0);
                        res.body.data.score.should.equal(0);
                        done();
                    });
            });
        });

        it('should add score and topic_count with class Counter', function (done) {
            let Co = new counter.Counter(mockUser);
            Co.score(5).topicCount(1).save(function (err, user) {
                should.not.exists(err);
                request.get('/api/v1/user/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.topic_count.should.equal(1);
                        res.body.data.score.should.equal(5);
                        done();
                    });
            });
        });

        it('should delete score and topic_count with class Counter', function (done) {
            let Co = new counter.Counter(mockUser);
            Co.score(-5).topicCount(-1).save(function (err, user) {
                should.not.exists(err);
                request.get('/api/v1/user/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.topic_count.should.equal(0);
                        res.body.data.score.should.equal(0);
                        done();
                    });
            });
        });

        it('should add count topic_collect_count when collect a topic', function (done) {
            counter.user(mockUser.id, 'topic', 'collect', function (err, user) {
                should.not.exists(err);
                request.get('/api/v1/user/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.collect_topic_count.should.equal(1);
                        done();
                    });
            });
        });

        it('should add count topic_collect_count when collect a topic with API', function (done) {
            // DONE (hhdem) 添加测试用例: 收藏主题后增加用户收藏主题数
            request.post('/topic/collect')
                .send({
                    topic_id: support.testTopic._id,
                })
                .set('Cookie', mockUserCookie)
                .expect(200, function (err, res) {
                    res.body.should.eql({status: 'success'});
                    request.get('/api/v1/user/' + mockUser.loginname)
                        .end(function (err, res) {
                            should.not.exists(err);
                            res.body.success.should.true();
                            res.body.data.collect_topic_count.should.equal(2);
                            done();
                        });
                });
        });

        it('should discount topic_collect_count when de_collect a topic', function (done) {
            counter.user(mockUser.id, 'topic', 'decollect', function (err, user) {
                should.not.exists(err);
                request.get('/api/v1/user/' + mockUser.loginname)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.collect_topic_count.should.equal(1);
                        done();
                    });
            });
        });

        it('should discount count topic_collect_count when de_collect a topic with API', function (done) {
            // DONE (hhdem) 添加测试用例: 取消收藏主题后减少用户收藏主题数
            request.post('/topic/de_collect')
                .send({
                    topic_id: support.testTopic._id,
                })
                .set('Cookie', mockUserCookie)
                .expect(200, function (err, res) {
                    res.body.should.eql({status: 'success'});
                    request.get('/api/v1/user/' + mockUser.loginname)
                        .end(function (err, res) {
                            should.not.exists(err);
                            res.body.success.should.true();
                            res.body.data.collect_topic_count.should.equal(0);
                            done();
                        });
                });
        });

    });

    describe('image counter', function () {

        var mockImage, mockBoard;

        before(function (done) {
            support.createBoard(support.normalUser._id, '', function (err, board) {
                mockBoard = board;
                support.createImage(support.normalUser._id, mockBoard, function (err, image) {
                    mockImage = image;
                    done(err);
                });
            });
        });

        it('should add geted_count', function (done) {
            counter.topic(mockImage.id, 'getted', function (err, image) {
                should.not.exists(err);
                request.get('/api/v2/images/' + mockImage.id)
                    .end(function (err, res) {
                        should.not.exists(err);
                        console.debug('should add geted_count --- >>> ', res.text);
                        res.body.success.should.true();
                        res.body.data.geted_count.should.equal(1);
                        done();
                    });
            });
        });

        it('should add geted_count after topic has been getted', function (done) {
            request.post('/api/v2/images/get')
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .send({
                    topic_id: support.testImage.id,
                    board_id: mockBoard.id,
                    desc: 'new get image desc'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.text.should.containEql('new get image desc');
                    res.text.should.containEql(support.testImage.image);
                    request.get('/api/v2/images/' + support.testImage.id)
                        .end(function (err, res) {
                            res.body.success.should.true();
                            res.body.data.geted_count.should.equal(1);
                            done();
                        });
                });
        });

        it('should add like_count', function (done) {
            counter.topic(mockImage.id, 'like', function (err, image) {
                should.not.exists(err);
                request.get('/api/v2/images/' + mockImage.id)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.like_count.should.equal(1);
                        done();
                    });
            });
        });

        it('should add like_count and sub like_count after topic was liked and unliked', function (done) {
            request.post('/api/v2/images/like')
                .set('Authorization', 'Bearer ' + mockUser.accessToken)
                .send({
                    id: support.testImage.id,
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    setTimeout(function() {
                        request.get('/api/v2/images/' + support.testImage.id)
                            .end(function (err, res) {
                                res.body.success.should.true();
                                res.body.data.like_count.should.equal(1);
                                request.post('/api/v2/images/like')
                                    .set('Authorization', 'Bearer ' + mockUser.accessToken)
                                    .send({
                                        id: support.testImage.id,
                                    })
                                    .end(function (err, res) {
                                        should.not.exists(err);
                                        res.body.success.should.true();
                                        request.get('/api/v2/images/' + support.testImage.id)
                                            .end(function (err, res) {
                                                res.body.success.should.true();
                                                res.body.data.like_count.should.equal(0);
                                                done();
                                            });
                                    });
                            });
                    }, 500);
                });
        });

        it('should sub like_count', function (done) {
            counter.topic(mockImage.id, 'unlike', function (err, image) {
                should.not.exists(err);
                request.get('/api/v2/images/' + mockImage.id)
                    .end(function (err, res) {
                        should.not.exists(err);
                        res.body.success.should.true();
                        res.body.data.like_count.should.equal(0);
                        done();
                    });
            });
        });
    });

});