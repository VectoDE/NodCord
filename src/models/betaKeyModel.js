const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const betaKeyModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

betaKeyModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `BetaKey-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('BetaKey', betaKeyModel);
