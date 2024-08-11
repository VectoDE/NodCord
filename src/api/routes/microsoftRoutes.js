const express = require('express');
const router = express.Router();
const microsoftController = require('../controllers/microsoftController');

router.get('/user/:userId', microsoftController.getUserInfo);

router.get('/services', microsoftController.getServices);

router.get(
  '/minecraft/profile/:minecraftUsername',
  microsoftController.getMinecraftProfile
);

router.get('/azure/vms/:subscriptionId', microsoftController.getAzureVMs);

router.get('/xbox/profile/:gamertag', microsoftController.getXboxLiveProfile);

module.exports = router;
