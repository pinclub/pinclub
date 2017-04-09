/*!
 * nodeclub - controllers/Image.js
 */

/**
 * Module dependencies.
 */

var validator = require('validator');

var at           = require('../common/at');
var User         = require('../proxy').User;
var Image        = require('../proxy').Topic;
var ImageCollect = require('../proxy').TopicCollect;
var EventProxy   = require('eventproxy');
var tools        = require('../common/tools');
var store        = require('../common/store');
var config       = require('../config');
var _            = require('lodash');
var cache        = require('../common/cache');
var logger = require('../common/logger')

/**
 * Image page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.index = function (req, res, next) {
  function isUped(user, reply) {
    if (!reply.ups) {
      return false;
    }
    return reply.ups.indexOf(user._id) !== -1;
  }

  var image_id = req.params.tid;
  var currentUser = req.session.user;

  if (image_id.length !== 24) {
    return res.render404('此图片不存在或已被删除。');
  }
  var events = ['image', 'other_images', 'no_reply_images', 'is_collect'];
  var ep = EventProxy.create(events,
    function (image, other_images, no_reply_images, is_collect) {
    res.render('image/index', {
      image: image,
      author_other_images: other_images,
      no_reply_images: no_reply_images,
      is_uped: isUped,
      is_collect: is_collect,
    });
  });

  ep.fail(next);

  Image.getFullTopic(image_id, ep.done(function (message, image, author, replies) {
    if (message) {
      logger.error('getFullImage error image_id: ' + image_id)
      return res.renderError(message);
    }

    image.visit_count += 1;
    image.save();

    image.author  = author;
    image.replies = replies;

    // 点赞数排名第三的回答，它的点赞数就是阈值
    image.reply_up_threshold = (function () {
      var allUpCount = replies.map(function (reply) {
        return reply.ups && reply.ups.length || 0;
      });
      allUpCount = _.sortBy(allUpCount, Number).reverse();

      var threshold = allUpCount[2] || 0;
      if (threshold < 3) {
        threshold = 3;
      }
      return threshold;
    })();

    ep.emit('image', image);

    // get other_Images
    var options = { limit: 5, sort: '-last_reply_at'};
    var query = { author_id: image.author_id, _id: { '$nin': [ image._id ] } };
    Image.getTopicsByQuery(query, options, ep.done('other_images'));

    // get no_reply_images
    cache.get('no_reply_images', ep.done(function (no_reply_images) {
      if (no_reply_images) {
        ep.emit('no_reply_images', no_reply_images);
      } else {
        Image.getTopicsByQuery(
          { reply_count: 0, tab: {$ne: 'job'}},
          { limit: 5, sort: '-create_at'},
          ep.done('no_reply_images', function (no_reply_images) {
            cache.set('no_reply_images', no_reply_images, 60 * 1);
            return no_reply_images;
          }));
      }
    }));
  }));

  if (!currentUser) {
    ep.emit('is_collect', null);
  } else {
    ImageCollect.getTopicCollect(currentUser._id, image_id, ep.done('is_collect'))
  }
};

exports.create = function (req, res, next) {
  res.render('image/edit', {
    tabs: config.tabs
  });
};


exports.put = function (req, res, next) {
  var title   = validator.trim(req.body.title);
  var tab     = validator.trim(req.body.tab);
  var content = validator.trim(req.body.t_content);

  // 得到所有的 tab, e.g. ['ask', 'share', ..]
  var allTabs = config.tabs.map(function (tPair) {
    return tPair[0];
  });

  // 验证
  var editError;
  if (title === '') {
    editError = '标题不能是空的。';
  } else if (title.length < 5 || title.length > 100) {
    editError = '标题字数太多或太少。';
  } else if (!tab || allTabs.indexOf(tab) === -1) {
    editError = '必须选择一个版块。';
  } else if (content === '') {
    editError = '内容不可为空';
  }
  // END 验证

  if (editError) {
    res.status(422);
    return res.render('image/edit', {
      edit_error: editError,
      title: title,
      content: content,
      tabs: config.tabs
    });
  }

  Image.newAndSave(title, content, tab, req.session.user._id, function (err, image) {
    if (err) {
      return next(err);
    }

    var proxy = new EventProxy();

    proxy.all('score_saved', function () {
      res.redirect('/image/' + image._id);
    });
    proxy.fail(next);
    User.getUserById(req.session.user._id, proxy.done(function (user) {
      user.score += 5;
      user.image_count += 1;
      user.save();
      req.session.user = user;
      proxy.emit('score_saved');
    }));

    //发送at消息
    at.sendMessageToMentionUsers(content, image._id, req.session.user._id);
  });
};

exports.showEdit = function (req, res, next) {
  var image_id = req.params.tid;

  Image.getTopicById(image_id, function (err, image, tags) {
    if (!image) {
      res.render404('此话题不存在或已被删除。');
      return;
    }

    if (String(image.author_id) === String(req.session.user._id) || req.session.user.is_admin) {
      res.render('image/edit', {
        action: 'edit',
        image_id: image._id,
        title: image.title,
        content: image.content,
        tab: image.tab,
        tabs: config.tabs
      });
    } else {
      res.renderError('对不起，你不能编辑此图片。', 403);
    }
  });
};

exports.update = function (req, res, next) {
  var image_id = req.params.tid;
  var title    = req.body.title;
  var tab      = req.body.tab;
  var content  = req.body.t_content;

  Image.getTopicById(image_id, function (err, image, tags) {
    if (!image) {
      res.render404('此话题不存在或已被删除。');
      return;
    }

    if (image.author_id.equals(req.session.user._id) || req.session.user.is_admin) {
      title   = validator.trim(title);
      tab     = validator.trim(tab);
      content = validator.trim(content);

      // 验证
      var editError;
      if (title === '') {
        editError = '标题不能是空的。';
      } else if (title.length < 5 || title.length > 100) {
        editError = '标题字数太多或太少。';
      } else if (!tab) {
        editError = '必须选择一个版块。';
      }
      // END 验证

      if (editError) {
        return res.render('image/edit', {
          action: 'edit',
          edit_error: editError,
          image_id: image._id,
          content: content,
          tabs: config.tabs
        });
      }

      //保存话题
      image.title     = title;
      image.content   = content;
      image.tab       = tab;
      image.update_at = new Date();

      Image.save(function (err) {
        if (err) {
          return next(err);
        }
        //发送at消息
        at.sendMessageToMentionUsers(content, image._id, req.session.user._id);

        res.redirect('/image/' + image._id);

      });
    } else {
      res.renderError('对不起，你不能编辑此话题。', 403);
    }
  });
};

exports.delete = function (req, res, next) {
  //删除话题, 话题作者Image_count减1
  //删除回复，回复作者reply_count减1
  //删除Image_collect，用户collect_Image_count减1

  var image_id = req.params.tid;

  Image.getFullTopic(image_id, function (err, err_msg, image, author, replies) {
    if (err) {
      return res.send({ success: false, message: err.message });
    }
    if (!req.session.user.is_admin && !(image.author_id.equals(req.session.user._id))) {
      res.status(403);
      return res.send({success: false, message: '无权限'});
    }
    if (!image) {
      res.status(422);
      return res.send({ success: false, message: '此话题不存在或已被删除。' });
    }
    author.score -= 5;
    author.image_count -= 1;
    author.save();

    image.deleted = true;
    image.save(function (err) {
      if (err) {
        return res.send({ success: false, message: err.message });
      }
      res.send({ success: true, message: '话题已被删除。' });
    });
  });
};

// 设为置顶
exports.top = function (req, res, next) {
  var image_id = req.params.tid;
  var referer  = req.get('referer');

  if (image_id.length !== 24) {
    res.render404('此话题不存在或已被删除。');
    return;
  }
  Image.getTopic(image_id, function (err, image) {
    if (err) {
      return next(err);
    }
    if (!image) {
      res.render404('此话题不存在或已被删除。');
      return;
    }
    image.top = !image.top;
    image.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = image.top ? '此话题已置顶。' : '此话题已取消置顶。';
      res.render('notify/notify', {success: msg, referer: referer});
    });
  });
};

// 设为精华
exports.good = function (req, res, next) {
  var imageId = req.params.tid;
  var referer = req.get('referer');

  Image.getTopic(imageId, function (err, image) {
    if (err) {
      return next(err);
    }
    if (!image) {
      res.render404('此话题不存在或已被删除。');
      return;
    }
    image.good = !image.good;
    image.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = image.good ? '此话题已加精。' : '此话题已取消加精。';
      res.render('notify/notify', {success: msg, referer: referer});
    });
  });
};

// 锁定主题，不可再回复
exports.lock = function (req, res, next) {
  var imageId = req.params.tid;
  var referer = req.get('referer');
  Image.getTopic(imageId, function (err, image) {
    if (err) {
      return next(err);
    }
    if (!image) {
      res.render404('此话题不存在或已被删除。');
      return;
    }
    image.lock = !image.lock;
    image.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = image.lock ? '此话题已锁定。' : '此话题已取消锁定。';
      res.render('notify/notify', {success: msg, referer: referer});
    });
  });
};

// 收藏主题
exports.collect = function (req, res, next) {
  var image_id = req.body.image_id;

  Image.getTopic(image_id, function (err, image) {
    if (err) {
      return next(err);
    }
    if (!image) {
      res.json({status: 'failed'});
    }

    ImageCollect.getTopicCollect(req.session.user._id, image._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({status: 'failed'});
        return;
      }

      ImageCollect.newAndSave(req.session.user._id, image._id, function (err) {
        if (err) {
          return next(err);
        }
        res.json({status: 'success'});
      });
      User.getUserById(req.session.user._id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_image_count += 1;
        user.save();
      });

      req.session.user.collect_image_count += 1;
      image.collect_count += 1;
      image.save();
    });
  });
};

exports.de_collect = function (req, res, next) {
  var image_id = req.body.image_id;
  Image.getTopic(image_id, function (err, image) {
    if (err) {
      return next(err);
    }
    if (!image) {
      res.json({status: 'failed'});
    }
    ImageCollect.remove(req.session.user._id, image._id, function (err, removeResult) {
      if (err) {
        return next(err);
      }
      if (removeResult.result.n == 0) {
        return res.json({status: 'failed'})
      }

      User.getUserById(req.session.user._id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_image_count -= 1;
        req.session.user = user;
        user.save();
      });

      image.collect_count -= 1;
      image.save();

      res.json({status: 'success'});
    });
  });
};

exports.upload = function (req, res, next) {
  var isFileLimit = false;
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      file.on('limit', function () {
        isFileLimit = true;

        res.json({
          success: false,
          msg: 'File size too large. Max is ' + config.file_limit
        })
      });

      store.upload(file, {filename: filename}, function (err, result) {
        if (err) {
          return next(err);
        }
        if (isFileLimit) {
          return;
        }
        res.json({
          success: true,
          url: result.url,
        });
      });

    });

  req.pipe(req.busboy);
};
