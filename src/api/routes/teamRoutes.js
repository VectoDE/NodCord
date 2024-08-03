const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.listTeams);

router.post('/', teamController.createTeam);

router.get('/:teamId', teamController.getTeamDetails);

router.put('/update', teamController.updateTeam);

router.delete('/delete', teamController.deleteTeam);

module.exports = router;
