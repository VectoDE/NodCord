const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.get('/', favoriteController.listFavorites);

router.post('/create', favoriteController.createFavorite);

router.post('/:favoriteId/delete', favoriteController.deleteFavorite);

module.exports = router;
