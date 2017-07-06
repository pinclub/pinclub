var express           = require('express');
var topicController   = require('./api/v2/topic');
var boardController   = require('./api/v2/board');
var imageController   = require('./api/v2/image');
var authController   = require('./api/v2/auth');
var forumController   = require('./api/v2/forum');
var nodeController   = require('./api/v2/node');
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
router.get('/images', imageController.index);
router.get('/images/sim', imageController.sim);
router.get('/images/:id', imageController.show);
router.post('/images/like', middleware.auth, imageController.like);
router.post('/images/get', middleware.auth, imageController.getImage);

// Board
router.get('/boards', middleware.auth, boardController.index);
router.post('/boards', middleware.auth, limit.peruserperday('create_board', config.create_board_per_day, {showJson: true}), boardController.create);
router.get('/boards/:id', middleware.auth, boardController.show);

// Board 收藏
router.get('/boards/collect/:loginname', boardController.collectList); // 关注列表
router.post('/boards/collect', middleware.auth, boardController.collect); // 关注某Board
router.post('/boards/de_collect', middleware.auth, boardController.decollect); // 取消关注某Board

// Forum
router.get('/forums', forumController.index); // Node 列表

// Node
router.get('/nodes', nodeController.index); // Node 列表

module.exports = router;
