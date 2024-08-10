const mongoose = require('mongoose');

const betaSystemSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('BetaSystem', betaSystemSchema);
