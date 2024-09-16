const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const balanceModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 100,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

balanceModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Balance-${uuidv4()}`;
  }
  next();
});

balanceModel.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Balance', balanceModel);
