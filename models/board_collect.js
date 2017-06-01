var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var BoardCollectSchema = new Schema({
  user: { type: ObjectId, ref: 'User' },
  board: { type: ObjectId, ref: 'Board' },
  create_at: { type: Date, default: Date.now }
});

BoardCollectSchema.plugin(BaseModel);
BoardCollectSchema.index({user: 1, board: 1}, {unique: true});

mongoose.model('BoardCollect', BoardCollectSchema);
