const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/', gameController.getAllGames);

router.get('/:gameId', gameController.getGameById);

router.post('/create', gameController.createGame);

router.post('/:gameId/update', gameController.updateGame);

router.post('/:gameId/delete', gameController.deleteGame);

module.exports = router;
