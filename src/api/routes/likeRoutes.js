const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');

router.get('/blog/:blogId', likeController.getLikesByBlog);

router.get('/:likeId', likeController.getLikeById);

router.post('/create', likeController.createLike);

router.post('/:likeId/delete', likeController.deleteLike);

module.exports = router;
