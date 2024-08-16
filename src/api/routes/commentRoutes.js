const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/create', commentController.createComment);

router.get('/blog/:blogId', commentController.getCommentsByBlog);

router.get('/:id', commentController.getCommentById);

router.put('/update/:id', commentController.updateComment);

router.delete('/delete/:id', commentController.deleteComment);

module.exports = router;
