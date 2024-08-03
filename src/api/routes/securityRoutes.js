const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

router.post('/apikey', securityController.generateApiKey);

router.use(securityController.verifyApiKey);

router.post('/bot-permissions', securityController.manageBotPermissions);

module.exports = router;
