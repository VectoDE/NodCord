const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);

router.get('/:categoryId', categoryController.getCategoryById);

router.post('/create', categoryController.createCategory);

router.post('/:categoryId/update', categoryController.updateCategory);

router.post('/:categoryId/delete', categoryController.deleteCategory);

module.exports = router;
