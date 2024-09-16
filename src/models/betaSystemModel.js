const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const betaSystemModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

betaSystemModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `BetaKeySystem-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('BetaSystem', betaSystemModel);
