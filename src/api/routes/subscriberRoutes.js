const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');

// Route zum Erstellen eines neuen Subscribers
router.post('/', subscriberController.createSubscriber);

// Route zum Abrufen aller Subscribers
router.get('/', subscriberController.getAllSubscribers);

// Route zum Abrufen eines Subscribers nach ID
router.get('/:id', subscriberController.getSubscriberById);

// Route zum Aktualisieren eines Subscribers nach ID
router.put('/:id', subscriberController.updateSubscriber);

// Route zum Löschen eines Subscribers nach ID
router.delete('/:id', subscriberController.deleteSubscriber);

module.exports = router;
