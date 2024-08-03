const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');

router.post('/', shareController.createShare);

router.get('/blog/:blogId', shareController.getSharesByBlog);

router.get('/:id', shareController.getShareById);

router.delete('/:id', shareController.deleteShare);

module.exports = router;
