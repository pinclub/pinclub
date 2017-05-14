var should = require('should');
var path = require('path');
var app = require('../../app');
var request = require('supertest')(app);
var support = require('../support/support');
var mm = require('mm');
var store = require('../../common/store');
var pedding = require('pedding');

describe('test/controllers/image.test.js', function () {

    var imagePath, mockUser, mockBoard;
    before(function (done) {
        imagePath = path.join(__dirname, '/test.JPG');
        support.createUser(function (err, user) {
            mockUser = user;
            support.createBoard(user.id, '', function (err, board) {
                mockBoard = board;
                done();
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
                    res.text.should.containEql('image_hash');
                    done(err);
                });
        });
    });

});
