var app = require('../../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../../support/support');


describe('test/api/v2/forum.test.js', function () {

    var mockForumPublic, mockForumPrivate, mockForumInternal;

    before(function (done) {
        support.createForum(support.adminUser._id, 'internal', function (err, forum) {
            mockForumInternal = forum;
            support.createForum(support.adminUser._id, 'private', function (err, forum1) {
                mockForumPrivate = forum1;
                support.createForum(support.adminUser._id, 'public', function (err, forum2) {
                    mockForumPublic = forum2;
                    done();
                });
            });
        });
    });

    describe('get /api/v2/forums', function () {
        it('should return forums', function (done) {
            request.get('/api/v2/forums')
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.false();
                    res.text.should.containEql('q 不能为空');
                    done();
                });
        });

        it('should find forums with param q="forum title" and not login', function (done) {
            request.get('/api/v2/forums')
                .query({
                    q: 'forum title'
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data.length.should.equal(2);
                    res.text.should.not.containEql(mockForumPrivate.title);
                    done();
                });
        });

        it('should find forums with param q="forum title" and login', function (done) {
            request.get('/api/v2/forums')
                .query({
                    q: 'forum title',
                    accesstoken: support.normalUser.accessToken
                })
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data.length.should.equal(3);
                    done();
                });
        });

        it('should find none of forums with param q="nothing can find" ', function (done) {
            request.get('/api/v2/forums')
                .query({
                    q: 'nothing can find'
                })
                .set('Authorization', 'Bearer ' + support.normalUser.accessToken)
                .end(function (err, res) {
                    should.not.exists(err);
                    res.body.success.should.true();
                    res.body.data.length.should.equal(0);
                    done();
                });
        });
    });

});
