const mongoose = require('mongoose');

// Definiere das Schema für den Subscriber
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    trim: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

// Erstelle das Modell aus dem Schema
module.exports = mongoose.model('Subscriber', subscriberSchema);
