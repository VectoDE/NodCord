const express = require('express');
const router = express.Router();
const eslController = require('../controllers/eslController');

router.get('/tournaments', eslController.getTournaments);

router.get('/tournaments/:tournamentId', eslController.getTournamentDetails);

router.get('/teams/:teamId', eslController.getTeamDetails);

router.get('/players/:playerId', eslController.getPlayerDetails);

module.exports = router;
