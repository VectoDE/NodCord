const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const dislikeModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  user: {
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

dislikeModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Dislike-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Dislike', dislikeModel);
