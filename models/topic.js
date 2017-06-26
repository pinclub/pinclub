var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var config = require('../config');
var _ = require('lodash');

var TopicSchema = new Schema({
    title: {type: String},
    content: {type: String},
    author: {type: ObjectId, ref: 'User'},
    top: {type: Boolean, default: false}, // 置顶帖
    good: {type: Boolean, default: false}, // 精华帖
    lock: {type: Boolean, default: false}, // 被锁定主题

    reply_count: {type: Number, default: 0},
    visit_count: {type: Number, default: 0},
    collect_count: {type: Number, default: 0},
    like_count: {type: Number, default: 0},
    geted_count: {type: Number, default: 0},

    create_at: {type: Date, default: Date.now},
    update_at: {type: Date, default: Date.now},
    last_reply: {type: ObjectId, ref: 'Reply'},
    last_reply_at: {type: Date, default: Date.now},
    content_is_html: {type: Boolean},
    tab: {type: String},
    deleted: {type: Boolean, default: false},

    // DONE (hhdem) 在 Topic 模型中增加 board 关联
    board: {type: ObjectId, ref: 'Board'},
    forum: {type: ObjectId, ref: 'Forum'},
    type: {type: String, default: 'text', enum: ['text', 'image']},
    image: {type: String},
    image_86: {type: String},
    image_430: {type: String},
    image_fixed: {type: String},
    image_hash: {type: String},
    image_colors: {type: [String]},
    image_colors_rgb: [],
    image_source: {type: String},

    get_from_topic: {type: ObjectId},

    profile_source: {type: String, default: false},
    //标签
    tags: [String]
});

TopicSchema.plugin(BaseModel);
TopicSchema.plugin(deepPopulate, {
    whitelist: [
        'last_reply.author'
    ]
});
TopicSchema.index({create_at: -1});
TopicSchema.index({top: -1, last_reply_at: -1});
TopicSchema.index({author: 1, create_at: -1});

TopicSchema.virtual('tabName').get(function () {
    var tab = this.tab;
    var pair = _.find(config.tabs, function (_pair) {
        return _pair[0] === tab;
    });

    if (pair) {
        return pair[1];
    } else {
        return '';
    }
});

mongoose.model('Topic', TopicSchema);
