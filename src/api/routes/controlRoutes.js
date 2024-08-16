const express = require('express');
const router = express.Router();
const controlController = require('../controllers/controlController');

router.post('/bot/start', controlController.startBot);
router.post('/bot/stop', controlController.stopBot);
router.post('/bot/restart', controlController.restartBot);
router.post('/bot/maintenance', controlController.setBotMaintenance);
router.post('/bot/remove-maintenance', controlController.removeBotMaintenance);
router.get('/bot/status', controlController.getBotStatus);

router.post('/api/start', controlController.startApi);
router.post('/api/stop', controlController.stopApi);
router.post('/api/restart', controlController.restartApi);
router.post('/api/maintenance', controlController.setAPIMaintenance);
router.post('/api/remove-maintenance', controlController.removeAPIMaintenance);
router.get('/api/status', controlController.getApiStatus);

module.exports = router;
