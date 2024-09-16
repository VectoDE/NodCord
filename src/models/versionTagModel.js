const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const versionTagModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

versionTagModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `VersionTag-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('VersionTag', versionTagModel);
