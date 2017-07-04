var app = require('../../app');
var cache = require('../../common/cache');
var should = require('should');
var request = require('supertest')(app);
var support = require('../support/support');

describe('test/common/cache.test.js', function () {
    it('should set && get', function (done) {
        cache.set('alsotang', {age: 23}, function () {
            cache.get('alsotang', function (err, data) {
                data.should.eql({age: 23});
                done();
            });
        });
    });

    it('should expire', function (done) {
        cache.set('alsotang', {age: 23}, 1, function () {
            setTimeout(function () {
                cache.get('alsotang', function (err, data) {
                    should.not.exist(data);
                    done();
                });
            }, 1.5 * 1000);
        });
    });

    it('should setOnline && getOnline', function (done) {
        cache.setOnline('testonline username', 'online', function (err) {
            should.not.exist(err);
            cache.setOnline('testonline username2', 'online', function (err) {
                should.not.exist(err);
                cache.getOnline(function (err, data) {
                    data.toString().should.containEql('testonline username');
                    done();
                });
            });
        });
    });

    it('should setOnline && getOnline with time 3 sec', function (done) {
        cache.setOnline('testonline username', 'online', 1, function (err) {
            should.not.exist(err);
            cache.getOnline(function (err, data) {
                should.not.exist(err);
                data.toString().should.containEql('testonline username');
                setTimeout(function () {
                    cache.getOnline(function (err, data) {
                        data.toString().should.not.containEql('testonline username');
                        done();
                    });
                }, 1 * 1000);
            });
        });
    });

    describe('save user_id to redis after login', function () {

        it('should save successful', function (done) {
            request.post('/signin')
                .send({
                    name: support.normalUser2.loginname,
                    pass: 'password',
                })
                .end(function (err, res) {
                    res.status.should.equal(302);
                    request.get('/signin')
                        .set('Cookie', support.normalUser2Cookie)
                        .end(function(err, res) {
                        cache.getOnline(function (err, data) {
                            data.toString().should.containEql(support.normalUser2.id);
                            done(err);
                        });
                    });
                });
        });

    });
});
