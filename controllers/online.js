var _ = require('lodash');
// var User = require('../proxy').User;
var cache = require('../common/cache');

exports.index = function (req, res, next) {
    cache.getOnline(function (err, data) {
        //
        // var opt = {limit: 100, sort: '-score'};
        // User.getUsersByQuery({is_block: false, _id: {$in: data}}, opt, function (err, data) {
        //     if (err) {
        //         return next(err);
        //     }
            res.render('user/online', {
                list: data
            });
        // });

    });
};