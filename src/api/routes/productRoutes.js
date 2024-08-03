const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.listProducts);

router.post('/', productController.createProduct);

router.get('/:productId', productController.getProductDetails);

router.put('/update', productController.updateProduct);

router.delete('/delete', productController.deleteProduct);

module.exports = router;
