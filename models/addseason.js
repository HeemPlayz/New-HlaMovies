const mongoose = require("mongoose");

const SeasonSchema = mongoose.Schema({
  
 _id: mongoose.Schema.Types.ObjectId,
  title: String,
  season: String,
  image: String,
  date: String,
  duration: String,
  age: String,
  categories: String,
  rate: String,
  
});


module.exports = mongoose.model("Season", SeasonSchema);