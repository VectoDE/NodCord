const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

router.post('/', newsletterController.addSubscriber);

router.get('/', newsletterController.getSubscribers);

router.delete('/:email', newsletterController.removeSubscriber);

module.exports = router;
