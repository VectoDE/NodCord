const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController');

// Route zum Erstellen eines neuen Features
router.post('/', featureController.createFeature);

// Route zum Abrufen aller Features
router.get('/', featureController.getAllFeatures);

// Route zum Abrufen eines Features nach ID
router.get('/:id', featureController.getFeatureById);

// Route zum Aktualisieren eines Features nach ID
router.put('/:id', featureController.updateFeature);

// Route zum Löschen eines Features nach ID
router.delete('/:id', featureController.deleteFeature);

module.exports = router;
