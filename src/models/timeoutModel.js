const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const timeoutModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
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

module.exports = mongoose.model('Timeout', timeoutModel);
