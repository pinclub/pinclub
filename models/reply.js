var mongoose  = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var ReplySchema = new Schema({
  content: { type: String },
  topic: { type: ObjectId, ref: 'Topic'},
  author: { type: ObjectId, ref: 'User'},
  reply_id: { type: ObjectId },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  content_is_html: { type: Boolean },
  ups: [Schema.Types.ObjectId],
  deleted: {type: Boolean, default: false},
});

ReplySchema.plugin(BaseModel);
ReplySchema.plugin(deepPopulate, {
    whitelist: [
        'topic.author',
        'topic.forum'
    ]
});
ReplySchema.index({topic: 1});
ReplySchema.index({author: 1, create_at: -1});

mongoose.model('Reply', ReplySchema);
