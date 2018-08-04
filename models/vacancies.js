let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Create Schema
let vacanciesSchema = Schema({
  _id: Schema.Types.ObjectId,
  title: {
    type: String,
    required: true,
    ref: 'Users'
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
  },
  application: {
    type: Number,
    default: 0
  },
  applicants: [{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  }]
});
var collectionName = 'vacancies'
var Vacancie = module.exports = mongoose.model('Vacancie', vacanciesSchema, collectionName);