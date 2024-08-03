const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');

router.post('/', likeController.createLike);

router.get('/blog/:blogId', likeController.getLikesByBlog);

router.get('/:id', likeController.getLikeById);

router.delete('/:id', likeController.deleteLike);

module.exports = router;
