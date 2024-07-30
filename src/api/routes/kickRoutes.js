const express = require('express');
const router = express.Router();
const kickController = require('../controllers/kickController');

// Route zum Kicken eines Mitglieds
router.post('/kick', kickController.kickMember);

// Route zum Auflisten aller Kicks für eine bestimmte Guild
router.get('/', kickController.listKicks);

module.exports = router;
