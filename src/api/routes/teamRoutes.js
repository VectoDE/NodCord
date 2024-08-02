const express = require('express');
const router = express.Router();
const teamController = require('../../controllers/teamController');

// Listet alle Teams auf
router.get('/', teamController.listTeams);

// Erstellt ein neues Team
router.post('/', teamController.createTeam);

// Zeigt Details eines bestimmten Teams an
router.get('/:teamId', teamController.getTeamDetails);

// Aktualisiert ein Team
router.put('/update', teamController.updateTeam);

// Entfernt ein Team
router.delete('/delete', teamController.deleteTeam);

module.exports = router;