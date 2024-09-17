const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Define the file schema
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
  url: {
    type: String,
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
  const baseURL = process.env.BASE_URL;
  const port = process.env.NODE_ENV === 'development' ? `:${process.env.API_PORT}` : '';
  this.url = `${baseURL}${port}/${this.path}`;
  next();
});

fileModel.virtual('name').get(function() {
  return this.filename;
});

fileModel.virtual('createdAt').get(function() {
  return this.uploadedAt.toLocaleDateString();
});

module.exports = mongoose.model('File', fileModel);
