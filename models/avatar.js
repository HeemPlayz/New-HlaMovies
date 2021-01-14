const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const AvatarSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
    username:String,
    avatar: String
}) ;
AvatarSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Avatar",AvatarSchema);