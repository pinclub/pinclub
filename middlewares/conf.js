var config = require('../config');

exports.github = function (req, res, next) {
  if (config.GITHUB_OAUTH.clientID === 'your GITHUB_CLIENT_ID') {
    return res.send('call the admin to set github oauth.');
  }
  next();
};

exports.wechat = function (req, res, next) {
    if (config.GITHUB_OAUTH.appID === 'your WECHAT_APP_ID') {
        return res.send('call the admin to set wechat oauth.');
    }
    next();
};
