const mongoose = require('mongoose');

const timeoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  timeoutAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Timeout', timeoutSchema);
