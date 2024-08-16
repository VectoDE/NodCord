const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/create', categoryController.createCategory);

router.get('/', categoryController.getCategories);

router.get('/:id', categoryController.getCategoryById);

router.put('/update/:id', categoryController.updateCategory);

router.delete('/delete/:id', categoryController.deleteCategory);

module.exports = router;
