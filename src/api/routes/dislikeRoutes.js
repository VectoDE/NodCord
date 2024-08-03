const express = require('express');
const router = express.Router();
const dislikeController = require('../controllers/dislikeController');

// Routen für Dislikes
router.post('/', dislikeController.createDislike); // Erstelle Dislike
router.get('/blog/:blogId', dislikeController.getDislikesByBlog); // Hole Dislikes nach Blog-ID
router.get('/:id', dislikeController.getDislikeById); // Hole Dislike nach ID
router.delete('/:id', dislikeController.deleteDislike); // Lösche Dislike

module.exports = router;
