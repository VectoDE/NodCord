const express = require('express');
const router = express.Router();
const customerOrderController = require('../controllers/customerOrderController');

// Route zum Erstellen einer neuen Bestellung
router.post('/', customerOrderController.createOrder);

// Route zum Abrufen aller Bestellungen
router.get('/', customerOrderController.getAllOrders);

// Route zum Abrufen einer Bestellung nach ID
router.get('/:id', customerOrderController.getOrderById);

// Route zum Aktualisieren einer Bestellung nach ID
router.put('/:id', customerOrderController.updateOrder);

// Route zum Löschen einer Bestellung nach ID
router.delete('/:id', customerOrderController.deleteOrder);

module.exports = router;
