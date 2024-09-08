const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController');

router.get('/', featureController.getAllFeatures);

router.get('/:featureId', featureController.getFeatureById);

router.post('/create', featureController.createFeature);

router.post('/:featureId/update', featureController.updateFeature);

router.post('/:featureId/delete', featureController.deleteFeature);

module.exports = router;
