var svgCaptcha = require('svg-captcha');

// static page
// About
exports.about = function (req, res, next) {
    res.render('static/about', {
        pageTitle: '关于我们'
    });
};

exports.advertise = function (req, res, next) {
    res.render('static/advertise', {
        pageTitle: '广告投放'
    });
};

exports.robots = function (req, res, next) {
    res.type('text/plain');
    res.send('# Robots.txt');
};

exports.captcha = function (req, res, next) {
    var captcha;
    if (process.env.NODE_ENV === 'test') {
        captcha = svgCaptcha('1234', {
            background: '#ffffff',
                width: 100,
                height: 34,
                noise: 0
        });
        req.session.captcha = '1234';
        captcha.data = captcha;
    } else {
        captcha = svgCaptcha.createMathExpr({
            background: '#ffffff',
            width: 100,
            height: 34,
            noise: 0
        });
        req.session.captcha = captcha.text;
    }
    res.set('Content-Type', 'image/svg+xml');
    res.status(200).send(captcha.data);
};
