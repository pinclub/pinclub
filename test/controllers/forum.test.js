var app = require('../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../support/support');

describe('test/controllers/forum.test.js', function () {

    var mockForum;

    before(function (done) {
        support.createForum(support.adminUser.id, 'public', function (err, forum) {
            mockForum = forum;
            done();
        });
    });

    describe('create forum', function () {
        it('should add a forum', function (done) {
            request.post('/admin/forums')
                .send({
                    title: 'Forum title',
                    content: 'Forum content',
                    path_name: 'path_name_of_new_forum',
                    type: 'public',
                    user: support.adminUser.id
                })
                .set('Cookie', support.adminUserCookie)
                .expect(302, function (err, res) {
                    res.headers.location.should.match(/^\/admin\/forums$/);
                    done(err);
                });
        });

        it('should not add forum when params not right', function (done) {
            request.post('/admin/forums')
                .send({
                    title: '',
                    content: 'Forum content',
                    path_name: 'path_name_of_new_forum',
                    type: 'not_valid_type',
                    user: support.adminUser.id
                })
                .set('Cookie', support.adminUserCookie)
                .expect(400, function (err, res) {
                    res.body.success.should.false();
                    res.text.should.containEql('参数验证失败');
                    res.text.should.containEql('板块名称不能为空');
                    res.text.should.containEql('type 必须为 public,private,internal');
                    done(err);
                });
        });

        it('should not create a forum when user not login', function (done) {
            request.post('/admin/forums')
                .send({
                    title: '',
                    content: 'Forum content',
                    path_name: 'path_name_of_new_forum',
                    type: 'not_valid_type',
                    user: support.adminUser.id
                })
                .expect(200, function (err, res) {
                    res.text.should.containEql('你还没有登录。');
                    done(err);
                });
        });

        it('should not create a forum if is not a admin', function (done) {
            request.post('/admin/forums')
                .send({
                    title: '',
                    content: 'Forum content',
                    path_name: 'path_name_of_new_forum',
                    type: 'not_valid_type',
                    user: support.adminUser.id
                })
                .set('Cookie', support.normalUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('需要管理员权限。');
                    done(err);
                });
        });
    });

    describe('edit forum', function () {
        it('should edit forum successful', function (done) {
            request.post('/admin/forums')
                .send({
                    id: support.testForum.id,
                    title: 'new_title',
                    content: 'Forum_content',
                    path_name: 'path_name_of_new_forum',
                    type: 'public'
                })
                .set('Cookie', support.adminUserCookie)
                .expect(302, function (err, res) {
                    res.headers.location.should.match(/^\/admin\/forums$/);
                    done(err);
                });
        });

        it('should not edit forum when params not right', function (done) {
            done();
        });

        it('should not edit forum when user not login', function (done) {
            done();
        });

        it('should not edit page if is not a admin', function (done) {
            done();
        });

        it('should update edit', function (done) {
            done();
        });
    });

    describe('delete forum', function () {
        it('should not delete when not admin', function (done) {
            done();
        });

        it('should alert warning message when delete forum that contain topics in it', function (done) {
            done();
        });

        it('should delete forum when there are topic in it', function (done) {
            done();
        });

        it('should delete forum', function (done) {
            done();
        });
    });

    describe('list forum', function () {
        it('should list all forums', function (done) {
            request.get('/admin/forums')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('path_name_of_new_forum');
                    done(err);
                });
        });

        it('should list right search result', function (done) {
            done();
        });
    });

    describe('show forum', function () {
        it('should show correct info of forum', function (done) {
            request.get('/admin/forums/' + mockForum.id)
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql(mockForum.title);
                    done(err);
                });
        });

        it('should return error when try to get an unexist forum', function (done) {
            request.get('/admin/forums/' + support.adminUser.id)
                .set('Cookie', support.adminUserCookie)
                .expect(404, function (err, res) {
                    res.text.should.containEql('板块不存在');
                    done(err);
                });
        });
    });
});

