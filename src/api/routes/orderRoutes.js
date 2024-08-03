const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route zum Erstellen einer Bestellung
router.post('/', orderController.createOrder);

// Route zum Aktualisieren des Bestellstatus
router.put('/:orderId', orderController.updateOrderStatus);

// Route zum Abrufen einer Bestellung
router.get('/:orderId', orderController.getOrder);

// Route zum Abrufen aller Bestellungen
router.get('/', orderController.getAllOrders);

module.exports = router;
