const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.post('/', logController.createLog);

router.get('/:logId', logController.getLog);

router.get('/', logController.getAllLogs);

router.delete('/:logId', logController.deleteLog);

module.exports = router;
