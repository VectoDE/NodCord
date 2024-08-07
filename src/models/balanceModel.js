const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
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

balanceSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Balance', balanceSchema);
