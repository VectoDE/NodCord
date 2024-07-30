const express = require('express');
const router = express.Router();
const timeoutController = require('../controllers/timeoutController');

// Route zum Auflisten aller Mitglieder mit aktiven Timeouts
router.get('/', timeoutController.listTimedOutMembers);

// Route zum Setzen eines Timeouts
router.post('/timeout', timeoutController.timeoutMember);

// Route zum Entfernen eines Timeouts
router.post('/remove', timeoutController.removeTimeout);

module.exports = router;
