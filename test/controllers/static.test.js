var app = require('../../app');
var request = require('supertest')(app);

describe('test/controllers/static.test.js', function () {
  it('should get /about', function (done) {
    request.get('/about').expect(200)
      .end(function (err, res) {
        res.text.should.containEql('Pinclub 是基于 Nodeclub 进行的二次开发. 增加了瀑布流展示方式, 主要参考花瓣网的设计风格(感谢花瓣网的设计师和前端工程师的辛勤工作), 加入了hanming距离的算法, 当然是在mongodb中使用了 function 的形式实现.');
        done(err);
      });
  });

  it('should get /robots.txt', function (done) {
    request.get('/robots.txt').expect(200)
      .end(function (err, res) {
        res.text.should.containEql('Robots.txt');
        done(err);
      });
  });
});
