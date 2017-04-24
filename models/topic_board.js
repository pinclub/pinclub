/**
 * Created by hhdem on 22/04/2017.
 */
var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var TopicBoardSchema = new Schema({
    user_id: { type: ObjectId },
    topic_id: { type: ObjectId },
    board_id: { type:ObjectId},
    create_at: { type: Date, default: Date.now }
});

TopicBoardSchema.plugin(BaseModel);
TopicBoardSchema.index({user_id: 1, topic_id: 1, board_id: 1}, {unique: true});

mongoose.model('TopicBoard', TopicBoardSchema);
