let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Create Schema
let userSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  prename: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  docs: {
    type: Object,
    required: true
  },
  paths: {
    type: Array,
    required: true
  },
  origins: [{
    type: Schema.Types.ObjectId,
    ref: 'Vacancie',
    required: true
  }],
  nlp: {
    type: Object,
    required: false
  },
  output: {
    type: Object,
    required: false
  }  
});
var collectionName = 'users'
var User = module.exports = mongoose.model('User', userSchema, collectionName);