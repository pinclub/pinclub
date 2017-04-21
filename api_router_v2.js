var express           = require('express');
var topicController   = require('./api/v2/topic');
var middleware        = require('./api/v2/middleware');
var limit             = require('./middlewares/limit');
var config            = require('./config');

var router            = express.Router();


// 主题
router.get('/topics', topicController.index);
router.get('/topics/sim', topicController.sim);
router.get('/topic/:id', middleware.tryAuth, topicController.show);
router.post('/topics', middleware.auth, limit.peruserperday('create_topic', config.create_post_per_day, {showJson: true}), topicController.create);
router.post('/topics/update', middleware.auth, topicController.update);

module.exports = router;
