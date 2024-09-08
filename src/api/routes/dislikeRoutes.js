const express = require('express');
const router = express.Router();
const dislikeController = require('../controllers/dislikeController');

router.get('/blog/:blogId', dislikeController.getDislikesByBlog);

router.get('/:dislikeId', dislikeController.getDislikeById);

router.post('/create', dislikeController.createDislike);

router.post('/:dislikeId/delete', dislikeController.deleteDislike);

module.exports = router;
