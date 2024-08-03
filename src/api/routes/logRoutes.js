const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// Route zur Erstellung eines Logs
router.post('/', logController.createLog);

// Route zum Abrufen eines Logs
router.get('/:logId', logController.getLog);

// Route zum Abrufen aller Logs
router.get('/', logController.getAllLogs);

// Route zum Löschen eines Logs
router.delete('/:logId', logController.deleteLog);

module.exports = router;
