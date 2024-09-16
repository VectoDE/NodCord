const mongoose = require('mongoose');

const roleplayModel = new mongoose.Schema({
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

roleplayModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Roleplay-${uuidv4()}`;
  }
  next();
});

roleplayModel.pre('save', function (next) {
  this.lastRoleplayDate = Date.now();
  next();
});

module.exports = mongoose.model('Roleplay', roleplayModel);
