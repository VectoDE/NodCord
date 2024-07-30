const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

// Endpunkt zum Erstellen eines neuen API-Schlüssels
router.post('/apikey', securityController.generateApiKey);

// Middleware zum Überprüfen des API-Schlüssels
router.use(securityController.verifyApiKey);

// Endpunkt zum Verwalten von Bot-Berechtigungen
router.post('/bot-permissions', securityController.manageBotPermissions);

module.exports = router;
