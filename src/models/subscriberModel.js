const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const subscriberModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    trim: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

subscriberModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Subscriber-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Subscriber', subscriberModel);
