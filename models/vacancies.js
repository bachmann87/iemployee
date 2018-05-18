let mongoose = require('mongoose');

// Create Schema
let vacanciesSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  fte: {
    type: Number,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  tags: {
    type: Array,
    required: true
  }
});
var collectionName = 'vacancies'
var Vacancie = module.exports = mongoose.model('Vacancie', vacanciesSchema, collectionName);