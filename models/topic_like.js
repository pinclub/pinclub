/**
 * Created by hhdem on 22/04/2017.
 */
var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var TopicLikeSchema = new Schema({
    user: { type: ObjectId, ref: 'User' },
    topic: { type: ObjectId, ref: 'Topic' },
    create_at: { type: Date, default: Date.now }
});

TopicLikeSchema.plugin(BaseModel);
TopicLikeSchema.index({user: 1, topic: 1}, {unique: true});

mongoose.model('TopicLike', TopicLikeSchema);
