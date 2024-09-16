const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const apiKeyModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

apiKeyModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `ApiKey-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('ApiKey', apiKeyModel);
