const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/', gameController.getAllGames);

router.get('/:id', gameController.getGameById);

router.post('/', gameController.createGame);

router.put('/:id', gameController.updateGame);

router.delete('/:id', gameController.deleteGame);

module.exports = router;
