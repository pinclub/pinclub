var conf = require('../../middlewares/conf');
var config = require('../../config');

describe('test/middlewares/conf.test.js', function () {
  it('should alert no github oauth', function (done) {
    var _clientID = config.GITHUB_OAUTH.clientID;
    config.GITHUB_OAUTH.clientID = 'your GITHUB_CLIENT_ID';
    conf.github({}, {send: function (str) {
      str.should.equal('call the admin to set github oauth.');
      config.GITHUB_OAUTH.clientID = _clientID;
      done();
    }});
  });

    it('should alert no wechat oauth', function (done) {
        var _appID = config.WECHAT_OAUTH.appID;
        config.WECHAT_OAUTH.appID = 'your WECHAT_APP_ID';
        conf.wechat({}, {send: function (str) {
            str.should.equal('call the admin to set wechat oauth.');
            config.WECHAT_OAUTH.appID = _appID;
            done();
        }});
    });
});
