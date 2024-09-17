const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const versionModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  picture: {
    type: String,
    default: '',
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  detailDescription: {
    type: String,
    required: true,
  },
  versionTag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VersionTag',
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
  developers: {
    type: [String],
    required: true,
  },
  githublink: {
    type: String,
    default: '',
    required: false,
  },
  downloadLink: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  releasedAt: {
    type: Date,
    required: true,
  },
});

versionModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Version-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Version', versionModel);
