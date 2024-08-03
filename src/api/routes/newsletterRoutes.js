const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

// Route zum Hinzufügen eines neuen Abonnenten
router.post('/', newsletterController.addSubscriber);

// Route zum Abrufen aller Abonnenten
router.get('/', newsletterController.getSubscribers);

// Route zum Entfernen eines Abonnenten
router.delete('/:email', newsletterController.removeSubscriber);

module.exports = router;
