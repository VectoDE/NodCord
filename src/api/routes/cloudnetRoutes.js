const express = require('express');
const router = express.Router();
const cloudNetController = require('../controllers/cloudnetController');

router.get('/status', cloudNetController.getStatus);

router.post('/servers', cloudNetController.createServer);

router.post('/servers/stop/:serverId', cloudNetController.stopServer);

router.get('/servers', cloudNetController.getServers);

router.get('/servers/:serverId', cloudNetController.getServerDetails);

router.delete('/servers/:serverId', cloudNetController.deleteServer);

module.exports = router;
