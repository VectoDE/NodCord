const express = require('express');
const router = express.Router();
const controlController = require('../controllers/controlController');

// Endpunkt zum Starten des Bots
router.post('/start', controlController.startBot);

// Endpunkt zum Stoppen des Bots
router.post('/stop', controlController.stopBot);

// Endpunkt zum Neustarten des Bots
router.post('/restart', controlController.restartBot);

module.exports = router;
