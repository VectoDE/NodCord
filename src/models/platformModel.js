const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const platformModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  picture: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  releaseDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

platformModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Platform-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Platform', platformModel);
