const express = require('express');
const router = express.Router();
const discordbotController = require('../controllers/discordbotController');

// Route für das Abrufen der Bot-Statistiken
router.get('/stats', discordbotController.getStats);

// Route für das Abrufen der Serverliste
router.get('/servers', discordbotController.getServerList);

module.exports = router;
