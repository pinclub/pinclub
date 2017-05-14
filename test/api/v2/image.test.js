var app = require('../../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../../support/support');

describe('test/api/v2/image.test.js', function () {
    var mockUser, mockImage;

    var createdImageId = null;

    before(function (done) {
        support.createUser(function (err, user) {
            mockUser = user;
            support.createBoard(user.id, '', function (err, board) {
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
    });

});
