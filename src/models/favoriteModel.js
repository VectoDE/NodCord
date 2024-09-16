const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const favoriteModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
    enum: ['project', 'product', 'task', 'company'],
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Kann auf verschiedene Modelle verweisen, abhängig vom 'type'
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

favoriteModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Favorite-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Favorite', favoriteModel);
