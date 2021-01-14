const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const AdminSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
    username:String,
  
}) ;
AdminSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Admin",AdminSchema);