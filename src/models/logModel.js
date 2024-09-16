const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const logModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  message: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['info', 'warn', 'error'],
    default: 'info',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  additionalData: {
    type: mongoose.Schema.Types.Mixed,
  },
});

logModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Log-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Log', logModel);
