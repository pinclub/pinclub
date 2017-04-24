var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var BoardSchema = new Schema({
    user_id: { type: ObjectId },
    title: { type: String },
    create_at: { type: Date, default: Date.now },
    type: {type: String},
    topic_count: {type: Number, default: 0}
});

BoardSchema.plugin(BaseModel);
BoardSchema.index({create_at: -1});
BoardSchema.index({user_id: 1, create_at: -1});

mongoose.model('Board', BoardSchema);