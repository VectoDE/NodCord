const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
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

fileSchema.virtual('url').get(function() {
  return `${process.env.BASE_URL}/${this.path}`;
});

fileSchema.virtual('name').get(function() {
  return this.filename;
});

fileSchema.virtual('createdAt').get(function() {
  return this.uploadedAt.toLocaleDateString();
});

module.exports = mongoose.model('File', fileSchema);
