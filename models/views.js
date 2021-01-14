const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const ViewsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
   title: String,
  views: Number
}) ;
ViewsSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Views",ViewsSchema);