const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const shareModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['Facebook', 'Twitter', 'LinkedIn', 'Other'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

shareModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Share-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Share', shareModel);
