// TODO 用户Board列表
exports.list = function (req, res, next) {
    res.render('static/function_building', {
        title: '所有Board列表'
    });
};

// TODO 用户Board信息查看
exports.show = function (req, res, next) {
    res.render('static/function_building', {
        title: 'Board信息查看'
    });
};

// TODO 用户Board信息修改
exports.update = function (req, res, next) {
    res.render('static/function_building', {
        title: 'Board信息修改'
    });
};

// TODO 用户Board信息删除
exports.delete = function (req, res, next) {
    res.render('static/function_building', {
        title: 'Board信息删除'
    });
};