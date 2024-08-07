const mongoose = require('mongoose');

const roleplaySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  characterName: {
    type: String,
    required: true,
  },
  characterLevel: {
    type: Number,
    default: 1,
  },
  experiencePoints: {
    type: Number,
    default: 0,
  },
  lastRoleplayDate: {
    type: Date,
    default: Date.now,
  },
});

roleplaySchema.pre('save', function (next) {
  this.lastRoleplayDate = Date.now();
  next();
});

module.exports = mongoose.model('Roleplay', roleplaySchema);
