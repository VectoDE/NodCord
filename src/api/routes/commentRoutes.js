const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Routen für Kommentare
router.post('/', commentController.createComment); // Erstelle Kommentar
router.get('/blog/:blogId', commentController.getCommentsByBlog); // Hole Kommentare nach Blog-ID
router.get('/:id', commentController.getCommentById); // Hole Kommentar nach ID
router.put('/:id', commentController.updateComment); // Aktualisiere Kommentar
router.delete('/:id', commentController.deleteComment); // Lösche Kommentar

module.exports = router;
