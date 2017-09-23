var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var ForumSchema = new Schema({
    user: { type: ObjectId,ref: 'User' }, // 创建者
    path_name: { type: String },
    title: { type: String },
    content: { type: String },
    create_at: { type: Date, default: Date.now },
    type: {type: String, default: 'text', enum: ['public', 'internal', 'private']},
    topic_count: {type: Number, default: 0},
    managers: [{type: ObjectId, ref: 'User'}],
    members: [{type: ObjectId, ref: 'User'}],
    order: {type: Number, default: 0},
    template: {type: String},
    bannerImage: {type: String},
    css_text: {type:String},
    js_text: {type:String},
    sidebar_text: {type:String},
    parent: {type: ObjectId, ref: 'Forum'},
    show_type: {type: String, default: 'default', enum: ['index', 'default']}, // index: 首页显示/ default: 默认
    code: {type:String},
    avatar: {type: String}
});

ForumSchema.plugin(BaseModel);
ForumSchema.index({create_at: -1});
ForumSchema.index({user: 1, create_at: -1});

ForumSchema.pre('save', function (next) {
    var now = new Date();
    this.update_at = now;
    next();
});

mongoose.model('Forum', ForumSchema);