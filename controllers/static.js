// static page
// About
exports.about = function (req, res, next) {
    res.render('static/about', {
        pageTitle: '关于我们'
    });
};

exports.robots = function (req, res, next) {
    res.type('text/plain');
    res.send('# Robots.txt');
};

