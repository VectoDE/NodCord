const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);

router.put('/:orderId', orderController.updateOrderStatus);

router.get('/:orderId', orderController.getOrder);

router.get('/', orderController.getAllOrders);

module.exports = router;
