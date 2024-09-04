const express = require('express');
const router = express.Router();
const betaController = require('../controllers/betaController');

router.post('/keys/create', betaController.createBetaKey);

router.get('/keys', betaController.getBetaKeys);

router.get('/keys/:id', betaController.getBetaKeyById);

router.post('/keys/update/:id', betaController.updateBetaKey);

router.post('/keys/delete/:id', betaController.deleteBetaKey);

router.post('/toggle', betaController.toggleBetaSystem);

router.post('/verify', betaController.verifyBetaKey);

module.exports = router;
