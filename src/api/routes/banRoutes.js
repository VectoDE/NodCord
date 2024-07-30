const express = require('express');
const router = express.Router();
const banController = require('../controllers/banController');

// Route zum Auflisten aller gebannten Mitglieder
router.get('/', banController.listBannedMembers);

// Route zum Bannen eines Mitglieds
router.post('/ban', banController.banMember);

// Route zum Entbannen eines Mitglieds
router.post('/unban', banController.unbanMember);

module.exports = router;
