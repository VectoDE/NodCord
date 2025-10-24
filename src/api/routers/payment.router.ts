const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.listPayments);

router.post('/', paymentController.createPayment);

router.get('/paypal-success', paymentController.paypalSuccess);

router.get('/paypal-cancel', paymentController.paypalCancel);

module.exports = router;
