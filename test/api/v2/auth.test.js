var app = require('../../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../../support/support');

describe('test/api/v2/auth.test.js', function () {
    var mockUser, mockImage;

    var createdImageId = null;

    before(function (done) {
        support.createUser(function (err, user) {
            mockUser = user;
            support.createImage(user.id, function (err, image) {
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
