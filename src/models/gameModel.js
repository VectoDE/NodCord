const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const gameModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  picture: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  detailDescription: {
    type: String,
  },
  genre: {
    type: String,
  },
  releaseDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  developer: {
    type: String,
  },
  platforms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Platform',
    },
  ],
  ratings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
    },
  ],
});

gameModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Game-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Game', gameModel);
