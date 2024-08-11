const express = require('express');
const router = express.Router();
const steamController = require('../controllers/steamController');

router.get('/player/:steamId', steamController.getPlayerSummaries);

router.get('/player/:steamId/games', steamController.getOwnedGames);

router.get(
  '/player/:steamId/achievements/:appId',
  steamController.getPlayerAchievements
);

router.get('/game/:appId', steamController.getGameDetails);

module.exports = router;
