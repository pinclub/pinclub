var express           = require('express');
var topicController   = require('./api/v2/topic');
var boardController   = require('./api/v2/board');
var imageController   = require('./api/v2/image');
var authController   = require('./api/v2/auth');
var middleware        = require('./api/v2/middleware');
var limit             = require('./middlewares/limit');
var config            = require('./config');

var router            = express.Router();

// Auth
router.post('/auth/signin', authController.signIn);

// 主题
router.get('/topics', topicController.index);
router.get('/topic/:id', middleware.tryAuth, topicController.show);
router.post('/topics', middleware.auth, limit.peruserperday('create_topic', config.create_post_per_day, {showJson: true}), topicController.create);
router.post('/topics/update', middleware.auth, topicController.update);

// 图片
router.get('/images/sim', imageController.sim);

// Board
router.get('/boards', middleware.auth, boardController.index);
router.post('/boards', middleware.auth, limit.peruserperday('create_board', config.create_board_per_day, {showJson: true}), boardController.create);

module.exports = router;
