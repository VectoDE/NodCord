const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Route zum Erstellen eines neuen Blog-Beitrags
router.post('/', blogController.createBlog);

// Route zum Abrufen aller Blog-Beiträge
router.get('/', blogController.getAllBlogs);

// Route zum Abrufen eines einzelnen Blog-Beitrags
router.get('/:id', blogController.getBlogById);

// Route zum Aktualisieren eines Blog-Beitrags
router.put('/:id', blogController.updateBlog);

// Route zum Löschen eines Blog-Beitrags
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
