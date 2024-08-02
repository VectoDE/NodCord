const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/paymentController');

// Listet alle Zahlungen eines Benutzers auf
router.get('/', paymentController.listPayments);

// Erstellt eine neue Zahlung
router.post('/', paymentController.createPayment);

// Erfolgreiche PayPal-Zahlung
router.get('/paypal-success', paymentController.paypalSuccess);

// Abgebrochene PayPal-Zahlung
router.get('/paypal-cancel', paymentController.paypalCancel);

module.exports = router;