/*!
 * nodeclub - route.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var express = require('express');
var sign = require('./controllers/sign');
var site = require('./controllers/site');
var user = require('./controllers/user');
var message = require('./controllers/message');
var topic = require('./controllers/topic');
var image = require('./controllers/image');
var board = require('./controllers/board');
var forum = require('./controllers/forum');
var node = require('./controllers/node');
var reply = require('./controllers/reply');
var online = require('./controllers/online');
var rss = require('./controllers/rss');
var staticController = require('./controllers/static');
var auth = require('./middlewares/auth');
var onlineM = require('./middlewares/online');
var limit = require('./middlewares/limit');
var github = require('./controllers/github');
var search = require('./controllers/search');
var static = require('./controllers/static');
var dashboard = require('./controllers/dashboard');
var passport = require('passport');
var configMiddleware = require('./middlewares/conf');
var config = require('./config');

var router = express.Router();

// home page
//router.get('/', site.index);

// pic home page
router.get('/', onlineM.add, site.index);

// sitemap
router.get('/sitemap.xml', site.sitemap);
// mobile app download
router.get('/app/download', site.appDownload);

// sign controller
if (config.allow_sign_up) {
  router.get('/signup', onlineM.add, sign.showSignup);  // 跳转到注册页面
  router.post('/signup', sign.signup);  // 提交注册信息
} else {
  // 进行github验证
  router.get('/signup', function (req, res, next) {
    return res.redirect('/auth/github');
  });
}
router.post('/signout', sign.signout);  // 登出
router.get('/signin', onlineM.add, sign.showLogin);  // 进入登录页面
router.post('/signin', sign.login);  // 登录校验
router.get('/active_account', sign.activeAccount);  //帐号激活
router.post('/signin/two_factor', sign.two_factor);  //帐号激活

router.get('/search_pass', onlineM.add, sign.showSearchPass);  // 找回密码页面
router.post('/search_pass', sign.updateSearchPass);  // 更新密码
router.get('/reset_pass', onlineM.add, sign.resetPass);  // 进入重置密码页面
router.post('/reset_pass', sign.updatePass);  // 更新密码

// user controller
router.get('/user/:name', onlineM.add, user.index); // 用户个人主页
router.get('/setting', onlineM.add, auth.userRequired, user.showSetting); // 用户个人设置页
router.post('/setting', auth.userRequired, user.setting); // 提交个人信息设置
router.get('/stars', onlineM.add, user.listStars); // 显示所有达人列表页
router.get('/users/top100', onlineM.add, user.top100);  // 显示积分前一百用户页
router.get('/user/:name/collections', onlineM.add, user.listCollectedTopics);  // 用户收藏的所有话题页
router.get('/user/:name/topics', onlineM.add, user.listTopics);  // 用户发布的所有话题页
router.get('/user/:name/replies', onlineM.add, user.listReplies);  // 用户参与的所有回复页
router.post('/user/:name/star', auth.adminRequired, user.toggleStar); // 把某用户设为达人
router.post('/user/:name/cancel_star', auth.adminRequired, user.toggleStar);  // 取消某用户的达人身份
router.post('/user/:name/block', auth.adminRequired, user.block);  // 禁言某用户
router.post('/user/:name/delete_all', auth.adminRequired, user.deleteAll);  // 删除某用户所有发言
router.get('/user/:name/get', onlineM.add, user.listGetImages);  // 获取某用户所有Get图片列表
router.get('/user/:name/boards', onlineM.add, auth.userRequired, board.index);  // 获取某用户所有Board列表
router.get('/user/:name/score', auth.userRequired, user.score);  // 删除某用户所有发言
router.post('/user/:name/two_factor', auth.userRequired, user.toggleTwoFactor); // 开启和关闭用户双因子认证

// message controler
router.get('/my/messages', onlineM.add, auth.userRequired, message.index); // 用户个人的所有消息页

// topic

// 新建文章界面
router.get('/topic/create', onlineM.add, auth.userRequired, topic.create);

router.get('/topic/:tid', onlineM.add, topic.index);  // 显示某个话题
router.post('/topic/:tid/top', auth.adminRequired, topic.top);  // 将某话题置顶
router.post('/topic/:tid/good', auth.adminRequired, topic.good); // 将某话题加精
router.get('/topic/:tid/edit', auth.userRequired, topic.showEdit);  // 编辑某话题
router.post('/topic/:tid/lock', auth.adminRequired, topic.lock); // 锁定主题，不能再回复

router.post('/topic/:tid/delete', auth.userRequired, topic.delete);

// 保存新建的文章
router.post('/topic/create', auth.userRequired, limit.peruserperday('create_topic', config.create_post_per_day, {showJson: false}), topic.put);

router.post('/topic/:tid/edit', auth.userRequired, topic.update);
router.post('/topic/collect', auth.userRequired, topic.collect); // 关注某话题
router.post('/topic/de_collect', auth.userRequired, topic.de_collect); // 取消关注某话题

// reply controller
router.post('/:topic/reply', auth.userRequired, limit.peruserperday('create_reply', config.create_reply_per_day, {showJson: false}), reply.add); // 提交一级回复
router.get('/reply/:reply_id/edit', auth.userRequired, reply.showEdit); // 修改自己的评论页
router.post('/reply/:reply_id/edit', auth.userRequired, reply.update); // 修改某评论
router.post('/reply/:reply_id/delete', auth.userRequired, reply.delete); // 删除某评论
router.post('/reply/:reply_id/up', auth.userRequired, reply.up); // 为评论点赞

//
router.post('/image/:tid/delete', auth.userRequired, image.delete);
router.post('/image/collect', auth.userRequired, image.collect); // 关注某图片话题
router.post('/image/de_collect', auth.userRequired, image.de_collect); // 取消关注某图片话题
router.post('/image/:tid/top', auth.adminRequired, image.top);  // 将某图片话题置顶
router.post('/image/:tid/good', auth.adminRequired, image.good); // 将某图片话题加精
router.post('/image/:tid/lock', auth.adminRequired, image.lock); // 锁定图片主题，不能再回复
// 通过Chrome 插件跳转到Get页面
router.get('/image/create/bookmarklet', auth.userSigninRequired, image.create);
// 通过Chrome 插件跳转到Get页面
router.post('/image/create/bookmarklet', auth.userSigninRequired, image.createFromChrome);

// board 列表
router.get('/boards', onlineM.add, auth.userSigninRequired, board.index);
router.post('/boards', auth.userSigninRequired, board.create);
router.get('/boards/:board_id', onlineM.add, board.show);
router.post('/boards/:board_id/edit', auth.userSigninRequired, board.edit);
router.post('/boards/:board_id/delete', auth.userSigninRequired, board.delete);
router.post('/board/collect', auth.userRequired, board.collect); // 关注某Board
router.post('/board/de_collect', auth.userRequired, board.collect); // 取消关注Board

// forum 列表
router.get('/forums/:id', forum.show);

// upload
router.post('/upload', auth.userRequired, topic.upload); //上传图片
router.post('/imageupload', auth.userRequired, image.upload); //上传图片
router.post('/avatarupload', auth.userRequired, image.uploadAvatar); //上传头像
router.post('/forumupload', auth.userRequired, image.uploadForumAvatar); //上传头像

// static
router.get('/about', onlineM.add, staticController.about);
router.get('/advertise', onlineM.add, staticController.advertise);
router.get('/robots.txt', staticController.robots);

//rss
router.get('/rss', rss.index);

//captcha
router.get('/captcha', static.captcha);

// github oauth
router.get('/auth/github', configMiddleware.github, passport.authenticate('github'));
router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/signin' }),
  github.callback);
router.get('/auth/github/new', github.new);
router.post('/auth/github/create', limit.peripperday('create_user_per_ip', config.create_user_per_ip, {showJson: false}), github.create);

// wechat oauth
router.get('/auth/wechat', configMiddleware.wechat, passport.authenticate('wechat'));

router.get('/search', search.index);

router.get('/online', onlineM.add, online.index);

// admin dashboard
router.get('/admin/dashboard', auth.adminRequired, dashboard.dashboard);
router.get('/admin/dashboard/deleteAllImages', auth.adminRequired, dashboard.deleteAllImages);
router.get('/admin/tags', auth.adminRequired, dashboard.tags);
router.get('/admin/boards', auth.adminRequired, dashboard.boards);
router.post('/admin/boards/:board_id/edit', auth.adminRequired, board.adminEdit);
router.post('/admin/boards/refresh/count/:id', auth.adminRequired, board.refreshCount);
router.get('/admin/users', auth.adminRequired, dashboard.users);
router.post('/admin/users/refresh/count/:id', auth.adminRequired, user.refreshCount);
// router.post('/admin/users', auth.adminRequired, dashboard.users);
router.get('/admin/nodes', auth.adminRequired, dashboard.nodes);
router.post('/admin/nodes', auth.adminRequired, node.create);
router.get('/admin/nodes/:id', auth.adminRequired, node.show);
router.get('/admin/forums', auth.adminRequired, dashboard.forums);
router.post('/admin/forums', auth.adminRequired, forum.create);
router.get('/admin/forums/:id', auth.adminRequired, dashboard.forumShow);
router.delete('/admin/forums/:id', auth.adminRequired, forum.delete);
router.post('/admin/forums/refresh/count/:id', auth.adminRequired, forum.refreshCount);

if (!config.debug) { // 这个兼容破坏了不少测试
	router.get('/:name', function (req, res) {
	  res.redirect('/user/' + req.params.name);
	});
}


module.exports = router;
