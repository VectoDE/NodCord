const express = require('express');
const router = express.Router();
const teamspeakController = require('../controllers/teamspeakController');

router.get('/info', teamspeakController.getServerInfo);

router.get('/channels', teamspeakController.getChannels);

router.get('/users', teamspeakController.getUsers);

router.post('/channels', teamspeakController.createChannel);

router.delete('/channels/:channelId', teamspeakController.deleteChannel);

router.post('/users', teamspeakController.createUser);

router.delete('/users/:userId', teamspeakController.deleteUser);

module.exports = router;
