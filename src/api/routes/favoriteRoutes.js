const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/favoriteController');

// Listet alle Favoriten eines Benutzers auf
router.get('/', favoriteController.listFavorites);

// Erstellt einen neuen Favoriten
router.post('/', favoriteController.createFavorite);

// Entfernt einen Favoriten
router.delete('/', favoriteController.deleteFavorite);

module.exports = router;