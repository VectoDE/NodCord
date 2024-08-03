const express = require('express');
const router = express.Router();
const dislikeController = require('../controllers/dislikeController');

router.post('/', dislikeController.createDislike);

router.get('/blog/:blogId', dislikeController.getDislikesByBlog);

router.get('/:id', dislikeController.getDislikeById);

router.delete('/:id', dislikeController.deleteDislike);

module.exports = router;
