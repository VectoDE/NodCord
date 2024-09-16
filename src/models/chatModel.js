const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const messageModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  participants: [
    {
      type: String,
      required: true,
    },
  ],
  messages: [messageModel],
  type: {
    type: String,
    enum: ['member_to_member', 'member_to_organization', 'member_to_group'],
    required: true,
  },
});

messageModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Message-${uuidv4()}`;
  }
  next();
});

chatModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Chat-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Chat', chatModel);
