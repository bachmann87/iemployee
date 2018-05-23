let mongoose = require('mongoose');

// Create Schema
let userSchema = mongoose.Schema({
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
  origins: {
    type: Array,
    required: true
  }  
});
var collectionName = 'users'
var User = module.exports = mongoose.model('User', userSchema, collectionName);