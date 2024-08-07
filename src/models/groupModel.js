const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming there's a User model
    },
  ],
});

module.exports = mongoose.model('Group', groupSchema);
