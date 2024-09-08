const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.listProducts);

router.get('/:productId', productController.getProductDetails);

router.post('/create', productController.createProduct);

router.post('/:productId/update', productController.updateProduct);

router.post('/:productId/delete', productController.deleteProduct);

module.exports = router;
