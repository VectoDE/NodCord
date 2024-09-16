const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const newsletterModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

newsletterModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Newsletter-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Newsletter', newsletterModel);
