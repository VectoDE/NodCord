const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Route zum Erstellen eines neuen Customers
router.post('/', customerController.createCustomer);

// Route zum Abrufen aller Customers
router.get('/', customerController.getAllCustomers);

// Route zum Abrufen eines Customers nach ID
router.get('/:id', customerController.getCustomerById);

// Route zum Aktualisieren eines Customers nach ID
router.put('/:id', customerController.updateCustomer);

// Route zum Löschen eines Customers nach ID
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
