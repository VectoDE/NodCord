const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Route für API-Status
router.get('/status', apiController.getStatus);

// Route für API-Info
router.get('/info', apiController.getInfo);

module.exports = router;
