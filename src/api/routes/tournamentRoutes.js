const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');

router.post('/tournament', tournamentController.createTournament);

router.post( '/tournament/:tournamentId/team', tournamentController.registerTeam);

router.post('/tournament/:tournamentId/match', tournamentController.createMatch);

router.get('/tournament/:tournamentId', tournamentController.getTournament);

router.get('/tournaments', tournamentController.listTournaments);

router.put('/tournament/:tournamentId', tournamentController.updateTournament);

router.delete('/tournament/:tournamentId', tournamentController.deleteTournament);

module.exports = router;
