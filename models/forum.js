var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var ForumSchema = new Schema({
    user_id: { type: ObjectId }, // 创建者
    title: { type: String },
    content: { type: String },
    create_at: { type: Date, default: Date.now },
    type: {type: String, default: 'text', enum: ['public', 'internal', 'private']},
    topic_count: {type: Number, default: 0},
    managers: [{type: ObjectId, ref: 'User'}],
    members: [{type: ObjectId, ref: 'User'}],
    order: {type: Number},
    template: {type: String},
    bannerImage: {type: String},
    css_text: {type:String},
    js_text: {type:String}
});

ForumSchema.plugin(BaseModel);
ForumSchema.index({create_at: -1});
ForumSchema.index({user_id: 1, create_at: -1});

mongoose.model('Forum', ForumSchema);