const express = require('express');
const router = express.Router();
const { upload, checkDiskSpaceMiddleware } = require('../utils/multerUtil');
const fileController = require('../controllers/fileController');

// Route for uploading files
router.post('/upload', checkDiskSpaceMiddleware, upload, fileController.uploadFile);

// Route for retrieving file information
router.get('/:id', fileController.getFile);

// Route for downloading files
router.get('/download/:id', fileController.downloadFile);

module.exports = router;
