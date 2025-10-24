const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');

router.get('/', subscriberController.getAllSubscribers);

router.get('/:subscriberId', subscriberController.getSubscriberById);

router.post('/create', subscriberController.createSubscriber);

router.post('/:subscriberId/update', subscriberController.updateSubscriber);

router.post('/:subscriberId/delete', subscriberController.deleteSubscriber);

module.exports = router;
