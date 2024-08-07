const mongoose = require('mongoose');

const favoriteModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Verweist auf das User-Modell, falls vorhanden
  },
  type: {
    type: String,
    required: true,
    enum: ['project', 'product', 'task', 'company'], // Typen der Favoriten
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

module.exports = mongoose.model('Favorite', favoriteModel);
