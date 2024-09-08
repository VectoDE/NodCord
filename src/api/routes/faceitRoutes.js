const express = require('express');
const router = express.Router();
const faceitController = require('../controllers/faceitController');

router.get('/player/:nickname', faceitController.getPlayerInfo);

router.get('/player/:playerId/stats/:game', faceitController.getPlayerStats);

router.get('/player/:playerId/matches/:game', faceitController.getPlayerMatches);

router.get('/match/:matchId', faceitController.getMatchDetails);

module.exports = router;
