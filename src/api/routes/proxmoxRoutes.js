const express = require('express');
const router = express.Router();
const proxmoxController = require('../controllers/proxmoxController');

router.get('/nodes', proxmoxController.getNodes);

router.get('/nodes/:node/status', proxmoxController.getNodeStatus);

router.post('/nodes/:node/vms/:vmid/start', proxmoxController.startVM);

router.post('/nodes/:node/vms/:vmid/stop', proxmoxController.stopVM);

module.exports = router;
