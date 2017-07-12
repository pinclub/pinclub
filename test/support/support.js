var User = require('../../proxy/user');
var Topic = require('../../proxy/topic');
var Forum = require('../../proxy/forum');
var Node = require('../../proxy/node');
var Board = require('../../proxy/board');
var Reply = require('../../proxy/reply');
var ready = require('ready');
var EventProxy = require('eventproxy');
var tools = require('../../common/tools');

function randomInt() {
    return (Math.random() * 10000).toFixed(0);
}

var createUser = exports.createUser = function (callback) {
    var key = new Date().getTime() + '_' + randomInt();
    tools.bhash('password', function (err, passhash) {
        User.newAndSave('alsotang' + key, 'alsotang' + key, passhash, 'alsotang' + key + '@gmail.com', '', false, callback);
    });
};

exports.createUserByNameAndPwd = function (loginname, pwd, callback) {
    tools.bhash(pwd, function (err, passhash) {
        User.newAndSave(loginname, loginname, passhash, loginname + +new Date() + '@gmail.com', '', true, callback);
    });
};

var createForum = exports.createForum = function (authorId, type, callback) {
    var key = new Date().getTime() + '_' + randomInt();
    var forum = {
        title: 'forum title' + key,
        content: 'forum content' + key,
        path_name: key,
        type: type,
        user: authorId
    };
    Forum.newAndSave(forum, callback);
};

var createNode = exports.createNode = function (authorId, parent, callback) {
    var key = new Date().getTime() + '_' + randomInt();
    var node = {
        name: 'node name' + key,
        code: 'node code' + key,
        content: 'node content' + key,
        creator: authorId
    };
    if (!!parent) {
        node.parent = parent;
    }
    Node.newAndSave(node, callback);
};

var createTopic = exports.createTopic = function (authorId, forum, callback) {
    var key = new Date().getTime() + '_' + randomInt();
    Topic.newAndSave('topic title' + key, 'test topic content' + key, forum, authorId, 'pc', callback);
};

var createImage = exports.createImage = function (authorId, board, callback) {
    var key = new Date().getTime() + '_' + randomInt();
    var image = {};
    image.title = 'image title' + key;
    image.content = 'test image content' + key;
    image.author = authorId;
    image.type = 'image';
    image.image = 'xxxxx';
    image.board = board;
    Topic.newAndSaveImage(image, callback);
};

var createBoard = exports.createBoard = function (title, authorId, type, callback) {
    Board.newAndSave(title, type, authorId, callback);
};

var createReply = exports.createReply = function (topicId, authorId, callback) {
    Reply.newAndSave('I am content', topicId, authorId, callback);
};

exports.createSingleUp = function (replyId, userId, callback) {
    Reply.getReply(replyId, function (err, reply) {
        reply.ups = [];
        reply.ups.push(userId);
        reply.save(function (err, reply) {
            callback(err, reply);
        });
    });
};

function mockUser(user) {
    return 'mock_user=' + JSON.stringify(user) + ';';
}

exports.mockUser = mockUser;

exports.userCounter = function (query, callback) {
    User.getCountByQuery(query, function (err, count) {
        callback(err, count);
    });
};

exports.topicCounter = function (query, callback) {
    Topic.getCountByQuery(query, function (err, count) {
        callback(err, count);
    });
};

exports.boardCounter = function (query, callback) {
    Board.getCountByQuery(query, function (err, count) {
        callback(err, count);
    });
};

exports.forumCounter = function (query, callback) {
    Forum.getCountByQuery(query, function (err, count) {
        callback(err, count);
    });
};

exports.replyCounter = function (query, callback) {
    Reply.getCountByQuery(query, function (err, count) {
        callback(err, count);
    });
};

ready(exports);

var ep = new EventProxy();
ep.fail(function (err) {
    console.error(err);
});

ep.all('user', 'user2', 'user3', 'admin', function (user, user2, user3, admin) {
    exports.normalUser = user;
    exports.normalUserCookie = mockUser(user);

    exports.normalUser2 = user2;
    exports.normalUser2Cookie = mockUser(user2);

    exports.activedUser = user3;
    exports.activedUserCookie = mockUser(user3);

    var adminObj = admin.toObject();
    adminObj.is_admin = true;
    exports.adminUser = admin;
    exports.adminUserCookie = mockUser(adminObj);

    createForum(admin._id, 'public', function (err, forum) {
        exports.testForum = forum;
        createTopic(user._id, forum, ep.done('topic'));
        createBoard('board_title', user._id, 'public', ep.done('board'));
    });
});

ep.all('board', function (board) {
    exports.testBoard = board;
    createImage(exports.normalUser._id, board, ep.done('image'));
});

ep.all('image', function (image) {
    exports.testImage = image;
    createReply(image._id, exports.normalUser._id, ep.done('replyimage'));
});

ep.all('topic', function (topic) {
    exports.testTopic = topic;
    createReply(topic._id, exports.normalUser._id, ep.done('reply'));
});

ep.all('reply', 'replyimage', function (reply, replyimage) {
    exports.testReply = reply;
    exports.testReplyImage = replyimage;
    exports.ready(true);
});



ep.on('needActive', function (user) {
    user.active = true;
    user.save(function(err){
        ep.emit('user3', user);
    });
});

ep.on('emptyAccessToken', function (user) {
    user.accessToken = undefined;
    user.active = true;
    user.save(function(err){
        ep.emit('user2', user);
    });
});

createUser(ep.done('user'));
createUser(ep.done('emptyAccessToken'));
createUser(ep.done('needActive'));
createUser(ep.done('admin'));



