const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.post('/create', blogController.createBlog);

router.get('/', blogController.getAllBlogs);

router.get('/:id', blogController.getBlogById);

router.put('/update/:id', blogController.updateBlog);

router.delete('/delete/:id', blogController.deleteBlog);

module.exports = router;
