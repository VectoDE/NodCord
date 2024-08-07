const mongoose = require('mongoose');

const muteSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: 'No reason provided',
  },
  mutedAt: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
    required: true,
  },
  unmutedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Mute', muteSchema);
