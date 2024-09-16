const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const fileModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

fileModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `File-${uuidv4()}`;
  }
  next();
});

fileModel.virtual('url').get(function() {
  return `${process.env.BASE_URL}/${this.path}`;
});

fileModel.virtual('name').get(function() {
  return this.filename;
});

fileModel.virtual('createdAt').get(function() {
  return this.uploadedAt.toLocaleDateString();
});

module.exports = mongoose.model('File', fileModel);
