var Forum = require('../../proxy/forum');
var should = require('should');
var support = require('../support/support');

describe('test/proxy/forum.test.js', function () {

    describe('show forum by forum id', function () {
        it('should show correct info of forum with forum id', function (done) {
            Forum.getForumById(support.testForum.id, function(err, forum, creator, topics) {
                should.not.exists(err);
                forum.id.should.containEql(support.testForum.id);
                creator.id.should.containEql(support.testForum.user.toString());
                done();
            });
        });

        it('should get null for not exists forum id', function (done) {
            Forum.getForumById(support.testBoard.id, function(err, forum, creator, topics) {
                should.not.exists(err);
                should.not.exists(forum);
                should.not.exists(creator);
                should.not.exists(topics);
                done();
            });
        });
    });
});
