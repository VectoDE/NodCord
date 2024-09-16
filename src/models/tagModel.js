const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tagModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

tagModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Tag-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Tag', tagModel);
