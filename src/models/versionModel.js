const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  detailedDescription: {
    type: String,
    required: true,
  },
  features: {
    type: [String],
    default: [],
  },
  added: {
    type: [String],
    default: [],
  },
  fixed: {
    type: [String],
    default: [],
  },
  bugs: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  releasedAt: {
    type: Date,
    required: true,
  },
  developers: {
    type: [String],
    required: true,
  },
  downloadLink: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Version', versionSchema);
