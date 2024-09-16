const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const teamModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
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
      ref: 'User',
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

teamModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Team-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Team', teamModel);
