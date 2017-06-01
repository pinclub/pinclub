var User = require('../proxy').User;
var Topic = require('../proxy').Topic;

// type: user, topic, board, image
function Counter (obj){
    this.obj = obj;
}

// counter(obj).score().add()
Counter.prototype = {
    add : function(prop, score){
        this.obj[prop] += score;
        return this;
    },
    score : function(score){
        this.obj.score += score;
        return this;
    },
    replyCount : function(score){
        this.obj.reply_count += score;
        return this;
    },
    visitCount : function(score){
        this.obj.visit_count += score;
        return this;
    },
    topicCount : function(score){
        this.obj.topic_count += score;
        return this;
    },
    imageCount : function(score){
        this.obj.image_count += score;
        return this;
    },
    boardCount : function(score){
        this.obj.board_count += score;
        return this;
    },
    collectTopicCount : function(score){
        this.obj.collect_topic_count += score;
        return this;
    },
    collectBoardCount : function(score){
        this.obj.collect_board_count += score;
        return this;
    },
    collectImageCount : function(score){
        this.obj.collect_image_count += score;
        return this;
    },

    collectCount : function(score){
        this.obj.collect_count += score;
        return this;
    },
    // topic
    likeCount : function(score){
        this.obj.like_count += score;
        return this;
    },
    gettedCount : function(score){
        this.obj.geted_count += score;
        return this;
    },
    // end topic

    save : function(callback) {
        this.obj.save(callback);
    }
};

/**
 * 对用户对象计数
 * @param user: Mongo Model
 * @param modal: topic, image, reply, board
 * @param type: add, sub, collect, like
 */
function userObject (user, modal, type, callback){
    let counter = new Counter(user);
    let optScore = 5;
    let optCount = 1;
    if (type === 'sub') {
        optScore = -optScore;
        optCount = -optCount;
    }
    if (type === 'add' || type === 'sub') {
        counter.score(optScore);
    }
    if (modal === 'reply') {
        counter.replyCount(optCount);
    }
    if (modal === 'topic') {
        if (type === 'collect') {
            counter.collectTopicCount(optCount);
        } else if (type === 'decollect') {
            counter.collectTopicCount(-optCount);
        } else {
            counter.topicCount(optCount);
        }
    }
    if (modal === 'image') {
        if (type === 'collect') {
            counter.collectImageCount(optCount);
        } else if (type === 'decollect') {
            counter.collectImageCount(-optCount);
        } else {
            counter.imageCount(optCount);
        }
    }
    if (modal === 'board') {
        if (type === 'collect') {
            counter.collectBoardCount(optCount);
        } else if (type === 'decollect') {
            counter.collectBoardCount(-optCount);
        } else {
            counter.boardCount(optCount);
        }
    }

    counter.save(callback);
}

/**
 * 对 Topic 对象计数
 * @param user: Mongo Model
 * @param type: getted, visit, collect, decollect, like, unlike
 */
function topicObject (topic, type, callback){
    let counter = new Counter(topic);
    let optCount = 1;
    if (type === 'getted') {
        counter.gettedCount(optCount);
    } else if (type === 'like') {
        counter.likeCount(optCount);
    } else if (type === 'collect') {
        counter.collectCount(optCount);
    } else if (type === 'unlike') {
        counter.likeCount(-optCount);
    } else if (type === 'decollect') {
        counter.collectCount(-optCount);
    } else if (type === 'visit') {
        counter.visitCount(optCount);
    }

    counter.save(callback);
}

/**
 * 对用户计数
 * @param id
 * @param modal: topic, image, reply, board
 * @param type: add, sub, collect, decollect, like, unlike
 */
exports.user = function(id, modal, type, callback){
    User.getUserById(id, function (err, user) {
        if (err) {
            return callback(err);
        }
        userObject(user, modal, type, callback);
    });
};

/**
 * 对 Topic 计数
 * @param id
 * @param type: getted, collect, decollect, like, unlike
 */
exports.topic = function(id, type, callback){
    Topic.getTopicById(id, function (err, topic) {
        // DONE(hhdem) 增加 err 的错误校验, 返回对应的错误信息
        if (err) {
            return callback(err);
        }
        topicObject(topic, type,  callback);
    });
};


exports.Counter = Counter;

exports.userObject = userObject;