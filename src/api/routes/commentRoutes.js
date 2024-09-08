const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/blog/:blogId', commentController.getCommentsByBlog);

router.get('/:commentId', commentController.getCommentById);

router.post('/create', commentController.createComment);

router.post('/:commentId/update', commentController.updateComment);

router.post('/:commentId/delete', commentController.deleteComment);

module.exports = router;
