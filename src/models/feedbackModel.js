const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const feedbackModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  feedbackText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

feedbackModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Feedback-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Feedback', feedbackModel);
