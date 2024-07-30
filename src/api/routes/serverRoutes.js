const express = require('express');
const serverController = require('../controllers/serverController');

const router = express.Router();

// Route zum Abrufen von Server-Informationen
router.get('/', serverController.getServerInfo);

// Route zum Aktualisieren von Server-Informationen
router.post('/', serverController.updateServerInfo);

module.exports = router;
