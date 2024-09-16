const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const groupModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

groupModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Group-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Group', groupModel);
