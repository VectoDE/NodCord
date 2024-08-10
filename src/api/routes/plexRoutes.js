const express = require('express');
const router = express.Router();
const plexController = require('../controllers/plexController');

router.get('/server/info', plexController.getServerInfo);

router.get('/library/sections', plexController.getLibrarySections);

router.get('/library/sections/:sectionId', plexController.getSectionContent);

router.post('/server/:serverId/play/:key', plexController.playMedia);

router.post('/server/:serverId/pause', plexController.pauseMedia);

router.post('/server/:serverId/stop', plexController.stopMedia);

module.exports = router;
