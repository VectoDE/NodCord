const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');

// Turnier erstellen
router.post('/tournament', tournamentController.createTournament);

// Team registrieren
router.post('/tournament/:tournamentId/team', tournamentController.registerTeam);

// Match erstellen
router.post('/tournament/:tournamentId/match', tournamentController.createMatch);

// Ein einzelnes Turnier anzeigen
router.get('/tournament/:tournamentId', tournamentController.getTournament);

// Alle Turniere anzeigen
router.get('/tournaments', tournamentController.listTournaments);

// Turnier aktualisieren
router.put('/tournament/:tournamentId', tournamentController.updateTournament);

// Turnier löschen
router.delete('/tournament/:tournamentId', tournamentController.deleteTournament);

module.exports = router;
