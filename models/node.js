var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var NodeSchema = new Schema({
    name: {type: String},
    code: {type: String},
    content: {type: String},
    parent: {type: ObjectId, ref: 'Node'},
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    creator: {type: ObjectId, ref: 'User'},
    deleted: {type: Boolean, default: false},
});

NodeSchema.plugin(BaseModel);
NodeSchema.index({creator: 1, create_at: -1});

mongoose.model('Node', NodeSchema);
