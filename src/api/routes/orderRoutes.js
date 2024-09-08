const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);

router.get('/:orderId', orderController.getOrder);

router.post('/create', orderController.createOrder);

router.post('/:orderId/update', orderController.updateOrderStatus);

router.post('/:orderId/delete', orderController.deleteOrderStatus);

module.exports = router;
