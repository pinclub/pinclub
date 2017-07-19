/*!
 * nodeclub - site index controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var Forum = require('../proxy').Forum;
var config = require('../config');
var EventProxy = require('eventproxy');
var cache = require('../common/cache');
var xmlbuilder = require('xmlbuilder');
var renderHelper = require('../common/render_helper');
var _ = require('lodash');

exports.index = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var tab = req.query.tab;
    var forum = req.query.forum;
    var currentUser = req.session.user;
    var proxy = new EventProxy();
    proxy.fail(next);

    // 取主题
    var query = {};
    if (!!tab) {
        if (tab === 'good') {
            query.good = true;
        }
    }
    if (!!forum) {
        query.forum = forum;
    }
    var limit = config.list_topic_count;
    var options = {skip: (page - 1) * limit, limit: limit, sort: '-top -last_reply_at'};

    // 取排行榜上的用户
    cache.get('tops', proxy.done(function (tops) {
        if (tops) {
            proxy.emit('tops', tops);
        } else {
            User.getUsersByQuery(
                {is_block: false},
                {limit: 10, sort: '-score'},
                proxy.done('tops', function (tops) {
                    cache.set('tops', tops, 60 * 1);
                    return tops;
                })
            );
        }
    }));
    // END 取排行榜上的用户

    // 取0回复的主题
    cache.get('no_reply_topics', proxy.done(function (no_reply_topics) {
        if (no_reply_topics) {
            proxy.emit('no_reply_topics', no_reply_topics);
        } else {
            Topic.getTopicsByQuery(
                {reply_count: 0, tab: {$nin: ['job', 'dev']}, type: 'text'},
                {limit: 5, sort: '-create_at'},
                proxy.done('no_reply_topics', function (no_reply_topics) {
                    cache.set('no_reply_topics', no_reply_topics, 60 * 1);
                    return no_reply_topics;
                }));
        }
    }));
    // END 取0回复的主题

    proxy.on('forums',
        function (forums) {
        if (!query.forum) {
            var forumIds = _.map(forums, '_id');
            query.forum = {$in: forumIds};
        }
        proxy.emit('forums2', forums);
        Topic.getTopicsByQuery(query, options, proxy.done('topics', function (topics) {
            return topics;
        }));

        // 取分页数据
        var pagesCacheKey = JSON.stringify(query) + 'pages';
        cache.get(pagesCacheKey, proxy.done(function (pages) {
            if (pages) {
                proxy.emit('pages', pages);
            } else {
                Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
                    var pages = Math.ceil(all_topics_count / limit);
                    cache.set(pagesCacheKey, pages, 60 * 1);

                    Topic.getTopicsByQuery(query, options, proxy.done('topics', function (topics) {
                        return topics;
                    }));

                    proxy.emit('pages', pages);
                }));
            }
        }));
        // END 取分页数据
    });

    // 取板块数据
    var queryForum = {};
    queryForum.type = 'public';
    queryForum.show_type = 'index';
    queryForum.parent = {$exists: false };
    if (!!currentUser) {
        queryForum.type = {$ne: 'private'};
    }
    var forumsCacheKey = JSON.stringify(queryForum) + 'pages';
    cache.get(forumsCacheKey, proxy.done(function (forums) {
        if (forums) {
            proxy.emit('forums', forums);
        } else {
            Forum.getForumsByQuery(queryForum, {limit: 10}, proxy.done(function (forums) {
                cache.set(forumsCacheKey, forums, 60 * 1);
                proxy.emit('forums', forums);
            }));
        }
    }));
    // END 取分页数据

    var tabName = renderHelper.tabName(tab);
    proxy.all('topics', 'tops', 'no_reply_topics', 'pages', 'forums2',
        function (topics, tops, no_reply_topics, pages, forums) {
            res.render('index', {
                topics: topics,
                current_page: page,
                list_topic_count: limit,
                tops: tops,
                no_reply_topics: no_reply_topics,
                pages: pages,
                tabs: config.tabs,
                tab: tab,
                forums: forums,
                pageTitle: tabName && (tabName + '版块'),
                picConfig: {
                    lazyload: config.lazyload,
                    pic_inner_scroll: config.pic_inner_scroll
                }
            });
        });
};

exports.sitemap = function (req, res, next) {
    var urlset = xmlbuilder.create('urlset',
        {version: '1.0', encoding: 'UTF-8'});
    urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

    var ep = new EventProxy();
    ep.fail(next);

    ep.all('sitemap', function (sitemap) {
        res.type('xml');
        res.send(sitemap);
    });

    cache.get('sitemap', ep.done(function (sitemapData) {
        if (sitemapData) {
            ep.emit('sitemap', sitemapData);
        } else {
            Topic.getLimit5w(function (err, topics) {
                if (err) {
                    return next(err);
                }
                topics.forEach(function (topic) {
                    urlset.ele('url').ele('loc', 'http://cnodejs.org/topic/' + topic._id);
                });

                var sitemapData = urlset.end();
                // 缓存一天
                cache.set('sitemap', sitemapData, 3600 * 24);
                ep.emit('sitemap', sitemapData);
            });
        }
    }));
};

exports.appDownload = function (req, res, next) {
    res.redirect('https://github.com/soliury/noder-react-native/blob/master/README.md')
};
