const express = require('express');
const router = express.Router();
const discordController = require('../controllers/discordbotController');

// Endpunkt zum Abrufen aller Discord-Befehle
router.get('/commands', discordController.getDiscordCommands);

module.exports = router;
