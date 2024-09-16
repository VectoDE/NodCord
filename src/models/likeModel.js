const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const likeModel = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

likeModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Like-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Like', likeModel);
