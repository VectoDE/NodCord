const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');

router.get('/blog/:blogId', shareController.getSharesByBlog);

router.get('/:shareId', shareController.getShareById);

router.post('/create', shareController.createShare);

router.post('/:shareId/delete', shareController.deleteShare);

module.exports = router;
