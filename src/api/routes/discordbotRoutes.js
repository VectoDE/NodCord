const express = require('express');
const router = express.Router();
const discordbotController = require('../controllers/discordbotController');

router.get('/stats', discordbotController.getStats);

module.exports = router;
