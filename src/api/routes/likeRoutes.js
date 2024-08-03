const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');

// Routen für Likes
router.post('/', likeController.createLike); // Erstelle Like
router.get('/blog/:blogId', likeController.getLikesByBlog); // Hole Likes nach Blog-ID
router.get('/:id', likeController.getLikeById); // Hole Like nach ID
router.delete('/:id', likeController.deleteLike); // Lösche Like

module.exports = router;
