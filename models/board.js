var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;

var BoardSchema = new Schema({
    user_id: { type: ObjectId, ref: 'User' },
    title: { type: String },
    create_at: { type: Date, default: Date.now },
    type: {type: String, default: 'public', enum: ['private', 'public']},
    topic_count: {type: Number, default: 0},
    collect_count: {type: Number, default: 0},
    cover: {type: String}, // 封面
    content: {type: String},
    deleted: {type: Boolean, default: false}
});

BoardSchema.plugin(BaseModel);
BoardSchema.index({create_at: -1});
BoardSchema.index({user_id: 1, create_at: -1});

mongoose.model('Board', BoardSchema);