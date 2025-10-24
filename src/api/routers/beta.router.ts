const express = require('express');
const router = express.Router();
const betaController = require('../controllers/betaController');

router.get('/keys', betaController.getBetaKeys);

router.get('/keys/:keyId', betaController.getBetaKeyById);

router.post('/keys/create', betaController.createBetaKey);

router.post('/keys/:keyId/update', betaController.updateBetaKey);

router.post('/keys/:keyId/delete', betaController.deleteBetaKey);

router.post('/toggle', betaController.toggleBetaSystem);

router.post('/verify', betaController.verifyBetaKey);

module.exports = router;
