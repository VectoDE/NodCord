const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');

// Routen für Shares
router.post('/', shareController.createShare); // Erstelle Share
router.get('/blog/:blogId', shareController.getSharesByBlog); // Hole Shares nach Blog-ID
router.get('/:id', shareController.getShareById); // Hole Share nach ID
router.delete('/:id', shareController.deleteShare); // Lösche Share

module.exports = router;
