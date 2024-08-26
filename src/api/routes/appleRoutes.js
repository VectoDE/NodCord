const express = require('express');
const appleController = require('../controllers/appleController');

const router = express.Router();

// Route to get Apple product details by product ID
router.get('/product/:productId', appleController.getProduct);

// Route to create a new Apple payment
router.post('/payment', appleController.createPayment);

// Route to verify an Apple purchase
router.post('/verify-purchase', appleController.verifyPurchase);

module.exports = router;