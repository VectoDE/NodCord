const mongoose = require('mongoose');

const slowmodeMode = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  setBy: {
    type: String,
    required: true,
  },
  setAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Slowmode', slowmodeMode);
