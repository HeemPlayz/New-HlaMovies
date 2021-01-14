const mongoose = require("mongoose");

const MoviesSchema = mongoose.Schema({
  
 _id: mongoose.Schema.Types.ObjectId,
  title: String,
  image: String,
  date: String,
  duration: String,
  age: String,
  categories: String,
  rate: String,
  story: String,
  watch: { type: String, default: "None" },
  download: { type: String, default: "None" },
  
});


module.exports = mongoose.model("Movie", MoviesSchema);