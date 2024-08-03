const express = require('express');
const router = express.Router();
const customerOrderController = require('../controllers/customerOrderController');

router.post('/', customerOrderController.createOrder);

router.get('/', customerOrderController.getAllOrders);

router.get('/:id', customerOrderController.getOrderById);

router.put('/:id', customerOrderController.updateOrder);

router.delete('/:id', customerOrderController.deleteOrder);

module.exports = router;
