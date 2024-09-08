const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getAllCustomers);

router.get('/:customerId', customerController.getCustomerById);

router.post('/create', customerController.createCustomer);

router.post('/:customerId/update', customerController.updateCustomer);

router.post('/:customerId/delete', customerController.deleteCustomer);

module.exports = router;
