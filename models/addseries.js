const mongoose = require("mongoose");

const SeriesSchema = mongoose.Schema({
  
 _id: mongoose.Schema.Types.ObjectId,
  title: String,
  image: String,
  date: String,
  duration: String,
  age: String,
  categories: String,
  rate: String,
  story: String,
  
});


module.exports = mongoose.model("Series", SeriesSchema);