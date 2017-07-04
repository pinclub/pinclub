var cache = require('../common/cache');

/**
 * structure
 *  userid:loginname:url
 * @param req
 * @param res
 * @param next
 */
exports.add = function (req, res, next) {
    // let requrl = req.url;
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    let userInfo = ip+':noone';
    if (req.user || req.session.user) {
        userInfo = (req.user || req.session.user).id + ':' + (req.user || req.session.user).loginname + ':'+ (req.user || req.session.user).avatar_url + ':' + ip;
    }
    // expire after 10 mins
    cache.setOnline(userInfo, 'online', 10 * 60, function (err) {
        cache.set(userInfo, req.url, function (err) {});
    });
    next();
};
