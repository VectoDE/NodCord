const mongoose = require('mongoose');

const teamModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming there's a User model
    },
  ],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  type: {
    type: String,
    enum: ['project', 'department', 'esports', 'other'],
    default: 'other',
  },
  logo: {
    type: String,
    default: 'default-team-logo.png', // A fallback logo
  },
});

module.exports = mongoose.model('Team', teamModel);
