const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ticketModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: 'No description provided',
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  messages: [
    {
      messageId: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      authorId: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ticketModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Ticket-${uuidv4()}`;
  }
  next();
});

ticketModel.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Ticket', ticketModel);
