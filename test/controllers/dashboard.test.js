var app = require('../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../support/support');

describe('test/controllers/dashboard.test.js', function () {

    var userCounter, boardCounter, forumCounter, topicCounter, imageCounter;
    before(function (done) {
        support.userCounter({}, function (err, counter) {
            userCounter = counter;
            support.topicCounter({type: 'text'}, function (err, topicCount) {
                topicCounter = topicCount;
                support.topicCounter({type: 'image'}, function (err, imageCount) {
                    imageCounter = imageCount;
                    support.boardCounter({}, function (err, boardCount) {
                        boardCounter = boardCount;
                        support.forumCounter({}, function (err, forumCount) {
                            forumCounter = forumCount;
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('show the right count of dashboard', function () {
        it('right number of users', function (done) {
            request.get('/admin/dashboard')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('<a href="/admin/users">'+ userCounter +'</a>');
                    done(err);
                });
        });

        it('right number of topics', function (done) {
            request.get('/admin/dashboard')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('<span class="light pull-right">'+ topicCounter +'</span>');
                    done(err);
                });
        });

        it('right number of images', function (done) {
            request.get('/admin/dashboard')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('<span class="light pull-right">'+ imageCounter +'</span>');
                    done(err);
                });
        });

        it('right number of forums', function (done) {
            request.get('/admin/dashboard')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('<h1 class="list-group-item-heading">'+forumCounter+'</h1>');
                    done(err);
                });
        });

        it('right number of boards', function (done) {
            request.get('/admin/dashboard')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('<a href="/admin/boards">'+ boardCounter +'</a>');
                    done(err);
                });
        });
    });

    describe('admin right for dashboard', function () {

        it('show signin page', function (done) {
            request.get('/admin/dashboard')
                .expect(200, function (err, res) {
                    res.text.should.containEql('你还没有登录。');
                    done(err);
                });
        });

        it('no right for normal user', function (done) {
            request.get('/admin/dashboard')
                .set('Cookie', support.normalUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('需要管理员权限。');
                    done(err);
                });
        });
    });

    describe('dashboard boards list', function () {

        it('show boards list page', function (done) {
            request.get('/admin/boards')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('Board列表');
                    done(err);
                });
        });

        it('no right to show boards page for normal user', function (done) {
            request.get('/admin/boards')
                .set('Cookie', support.normalUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('需要管理员权限。');
                    done(err);
                });
        });
    });

    describe('dashboard forums list', function () {

        it('show forums list page', function (done) {
            request.get('/admin/forums')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('板块列表');
                    done(err);
                });
        });

        it('no right to show forums page for normal user', function (done) {
            request.get('/admin/forums')
                .set('Cookie', support.normalUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('需要管理员权限。');
                    done(err);
                });
        });
    });

    describe('dashboard users list', function () {

        it('show users list page', function (done) {
            request.get('/admin/users')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('用户列表');
                    done(err);
                });
        });

        it('no right to show users page for normal user', function (done) {
            request.get('/admin/users')
                .set('Cookie', support.normalUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('需要管理员权限。');
                    done(err);
                });
        });
    });

});