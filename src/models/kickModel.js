const mongoose = require('mongoose');

const kickModel = new mongoose.Schema({
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
  kickedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Kick', kickModel);
