const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.listTeams);

router.get('/:teamId', teamController.getTeamDetails);

router.post('/create', teamController.createTeam);

router.post('/:teamId/update', teamController.updateTeam);

router.post('/:teamId/delete', teamController.deleteTeam);

module.exports = router;
