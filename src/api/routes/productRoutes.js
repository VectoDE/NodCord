const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Listet alle Produkte auf
router.get('/', productController.listProducts);

// Erstellt ein neues Produkt
router.post('/', productController.createProduct);

// Zeigt Details eines bestimmten Produkts an
router.get('/:productId', productController.getProductDetails);

// Aktualisiert ein Produkt
router.put('/update', productController.updateProduct);

// Entfernt ein Produkt
router.delete('/delete', productController.deleteProduct);

module.exports = router;
