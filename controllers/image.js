/*!
 * nodeclub - controllers/Image.js
 */

/**
 * Module dependencies.
 */

var getColors = require('get-image-colors');
var path = require('path');
var at = require('../common/at');
var User = require('../proxy').User;
var Image = require('../proxy').Topic;
var Board = require('../proxy').Board;
var ImageCollect = require('../proxy').TopicCollect;
var EventProxy = require('eventproxy');
var tools = require('../common/tools');
var store = require('../common/store');
var config = require('../config');
var structureHelper = require('../common/structure_helper');

var counter = require('../common/counter');
var ghash = require('ghash');

/**
 *
 * @param req
 * @param res
 * @param next
 */
exports.delete = function (req, res, next) {
    //删除话题, 话题作者Image_count减1
    //删除回复，回复作者reply_count减1
    //删除Image_collect，用户collect_Image_count减1

    var image_id = req.params.tid;

    Image.getFullTopic(image_id, function (err, err_msg, image, author, replies) {
        if (err) {
            return res.send({success: false, message: err.message});
        }
        if (!req.session.user.is_admin && !(image.author_id.equals(req.session.user._id))) {
            res.status(403);
            return res.send({success: false, message: '无权限'});
        }
        if (!image) {
            res.status(422);
            return res.send({success: false, message: '此话题不存在或已被删除。'});
        }

        counter.user(author, 'image', 'sub', function(err, user) {
            image.deleted = true;
            image.save(function (err) {
                if (err) {
                    return res.send({success: false, message: err.message});
                }
                res.send({success: true, message: '话题已被删除。'});
            });
        });

        // author.score -= 5;
        // author.image_count -= 1;
        // author.save();
        //
        // image.deleted = true;
        // image.save(function (err) {
        //     if (err) {
        //         return res.send({success: false, message: err.message});
        //     }
        //     res.send({success: true, message: '话题已被删除。'});
        // });
    });
};

// 设为置顶
exports.top = function (req, res, next) {
    var image_id = req.params.tid;
    var referer = req.get('referer');

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

            counter.user(req.session.user._id, 'image', 'collect', function (err, user) {
                if (err) {
                    return next(err);
                }
                req.session.user = user;
                image.collect_count += 1;
                image.save();
            });

            // User.getUserById(req.session.user._id, function (err, user) {
            //     if (err) {
            //         return next(err);
            //     }
            //     user.collect_image_count += 1;
            //     req.session.user.collect_image_count += 1;
            //     user.save();
            // });
            //
            // req.session.user.collect_image_count += 1;
            // image.collect_count += 1;
            // image.save();
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
            if (removeResult.result.n === 0) {
                return res.json({status: 'failed'});
            }

            counter.user(req.session.user._id, 'image', 'decollect', function (err, user) {
                if (err) {
                    return next(err);
                }
                req.session.user = user;

                image.collect_count -= 1;
                image.save();

                res.json({status: 'success'});
            });

            // User.getUserById(req.session.user._id, function (err, user) {
            //     if (err) {
            //         return next(err);
            //     }
            //     user.collect_image_count -= 1;
            //     req.session.user.collect_image_count -= 1;
            //     req.session.user = user;
            //     user.save();
            // });
            //
            // image.collect_count -= 1;
            // image.save();
            //
            // res.json({status: 'success'});
        });
    });
};

// DONE (hhdem) 不对val进行inspect
// DONE (hhdem) 上传图片支持 7牛云, 增加对应的配置
// DONE (hhdem) 更改hash参数生成方式为 ghash
// DONE (hhdem) 上传完图片后, 异步返回结果, 而不是等待 hash值 和 colors的获取
exports.upload = function (req, res, next) {
    var isFileLimit = false;
    var uploadResult;
    var topicImage = {};
    req.busboy.on('field', function(fieldname, value, fieldnameTruncated, valTruncated, encoding, mimetype) {

        topicImage[fieldname] = value;
    });

    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        file.on('limit', function () {
            isFileLimit = true;

            res.json({
                success: false,
                msg: 'File size too large. Max is ' + config.file_limit
            });
            return;
        });
        if (!topicImage.board || (!!topicImage.board && topicImage.board == 'undefined')) {
            res.json({
                success: false,
                msg: '未选择对应的Board'
            });
            return;
        }
        var ep = new EventProxy();
        let buffers = [];

        // 生成 hash 和 colors 之后保存图片信息
        ep.all('board_update', 'gen_image_hash', 'gen_image_color', function(board){
            Image.newAndSaveImage(topicImage, function (err, image) {
                console.info('start new image', new Date());
                if (err) {
                    return next(err);
                }
                topicImage.id = image.id;
                topicImage.board = board;
                // DONE (hhdem) 上传图片时与Board进行关联绑定, 目前Get图片已经做了关联, 上传图片还未做
                User.getUserById(req.session.user._id, function (err, user) {
                    user.score += 5;
                    user.image_count += 1;
                    user.save();
                    req.session.user.image_count += 1;
                    req.session.user = user;
                    topicImage.author_id = user.id;
                    topicImage.author = user;
                    ep.emit('new_image', topicImage);

                });

            });
        });

        // 获得 图片 buffer 进行hash计算
        file.on('data', function(data) {
            console.info('file data ', data);
            buffers.push(data);
        });

        // 文件内容传输完成后，计算图片的 hash 值和主色调列表
        file.on('end', function() {
            // TODO (hhdem) 图片 hash 和 colors 的生成顺序需要优化, 前台不依赖于后台返回的 hash 和 colors, 而是自己生成
            const fileBuffer = Buffer.concat(buffers);
            ghash(fileBuffer).calculate(function (err, hash) {
                console.info('start image hash', new Date());
                if (err) {
                    console.error(err);
                    return;
                }
                topicImage.image_hash = tools.hexToBinary(hash.toString('hex'));
                ep.emit('gen_image_hash');
            });
            getColors(fileBuffer, mimetype).then(colors => {
                console.info('start image colors', new Date());
                let rgbColor = [];
                let hexColor = [];
                colors.forEach(function (color) {
                    rgbColor.push(color.rgb());
                    hexColor.push(color.toString());
                });
                topicImage.image_colors = hexColor;
                topicImage.image_colors_rgb = rgbColor;
                ep.emit('gen_image_color');
            });
        });

        ep.fail(next);

        ep.all('new_image', function (topicImage) {
            console.info('start return success', new Date());
            res.json({
                success: true,
                data: [structureHelper.image(topicImage)]
            });
            //发送at消息
            at.sendMessageToMentionUsers(topicImage.title, topicImage._id, topicImage.author_id);
        });

        store.upload(file, {filename: filename, userId: req.session.user._id}, function (err, result) {

            if (err) {
                return next(err);
            }
            if (isFileLimit) {
                return;
            }
            console.info('start 7niu', new Date());

            if (config.qn_access && config.qn_access.secretKey !== 'your secret key') {
                // 7牛
                topicImage.image_fixed = result.url + config.qn_access.style[3];
                topicImage.image_430 = result.url + config.qn_access.style[1];
                topicImage.image_86 = result.url + config.qn_access.style[0];
                topicImage.image = result.url;
            } else {
                // 本地上传
                uploadResult = result;
                let filepath = path.resolve(__dirname, '..' + uploadResult.url);
                let extname = filepath.substring(filepath.lastIndexOf('.') + 1);
                let upload_path = uploadResult.url.substring(0, uploadResult.url.lastIndexOf('.'));
                let upload_fixed = upload_path + '_fixed.' + extname;
                let upload_86 = upload_path + '_86.' + extname;
                let upload_430 = upload_path + '_430.' + extname;
                // DONE (hhdem) 自动旋转图片方向, 此处代码优化性能, 挪到 store_local 中
                topicImage.image_fixed = upload_fixed;
                topicImage.image_86 = upload_86;
                topicImage.image_430 = upload_430;

                topicImage.image = uploadResult.url;

            }

            topicImage.type = 'image';
            topicImage.author_id = req.session.user;


            Board.getBoardById(topicImage.board, function (err, board) {
                console.info('start board', new Date());
                if (err) {
                    return next(err);
                }
                board.topic_count += 1;
                board.save();
                ep.emit('board_update', board);
            });

        });

    });

    req.busboy.on('finish', function() {
        console.log('Done parsing form!');

    });

    req.pipe(req.busboy);
};
