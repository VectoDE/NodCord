const express = require('express');
const router = express.Router();
const customerOrderController = require('../controllers/customerOrderController');

router.get('/', customerOrderController.getAllOrders);

router.get('/:id', customerOrderController.getOrderById);

router.post('/', customerOrderController.createOrder);

router.post('/:id', customerOrderController.updateOrder);

router.post('/:id', customerOrderController.deleteOrder);

module.exports = router;
