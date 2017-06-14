/**
 * Module dependencies.
 */
var app = require('../../app');
var request = require('supertest')(app);


describe('test/controllers/site.test.js', function () {

  it('should / 200', function (done) {
    request.get('/').end(function (err, res) {
      res.status.should.equal(200);
      res.text.should.containEql('回到顶部');
      done(err);
    });
  });

  it('should /?page=-1 200', function (done) {
    request.get('/?page=-1').end(function (err, res) {
      res.status.should.equal(200);
      res.text.should.containEql('回到顶部');
      done(err);
    });
  });

  it('should /sitemap.xml 200', function (done) {
    request.get('/sitemap.xml')
    .expect(200, function (err, res) {
      res.text.should.containEql('<url>');
      done(err);
    });
  });

  it('should /app/download', function (done) {
    request.get('/app/download')
      .expect(302, function (err, res) {
        done(err);
      });
  });
});
