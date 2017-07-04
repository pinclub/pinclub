var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;

var SettingSchema = new Schema({
    google_tongji: { type: String },
    title: { type: String },
    cover: {type: String}, // 封面
    content: {type: String}
});

SettingSchema.plugin(BaseModel);
SettingSchema.index({create_at: -1});
SettingSchema.index({user_id: 1, create_at: -1});

mongoose.model('Setting', SettingSchema);