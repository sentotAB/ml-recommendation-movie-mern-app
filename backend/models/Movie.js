const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  Series_Title: { type: String, required: true },
  Released_Year: String,
  Certificate: String,
  Runtime: String,
  Genre: String,
  IMDB_Rating: Number,
  Overview: String,
  Meta_score: Number,
  Director: String,
  Star1: String,
  Star2: String,
  Star3: String,
  Star4: String,
  No_of_Votes: Number,
  Gross: String,
  Poster_Link: String,
  content: String,
  Cluster: Number
}, { collection: 'movies' }); 

module.exports = mongoose.model('Movie', movieSchema);