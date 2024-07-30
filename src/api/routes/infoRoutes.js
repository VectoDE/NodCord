const express = require('express');
const router = express.Router();
const infoController = require('../controllers/infoController');

// Define routes
router.get('/system', infoController.getSystemInfo);

module.exports = router;
