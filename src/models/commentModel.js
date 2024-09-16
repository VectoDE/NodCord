const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const commentModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Verweist auf das User-Modell
    required: true,
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog', // Verweist auf das Blog-Modell
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

commentModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Comment-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Comment', commentModel);
