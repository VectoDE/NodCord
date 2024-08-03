const express = require('express');
const router = express.Router();
const { upload, checkDiskSpaceMiddleware } = require('../utils/multerUtil');
const fileController = require('../controllers/fileController');

router.post('/upload', checkDiskSpaceMiddleware, upload, fileController.uploadFile);

router.get('/:id', fileController.getFile);

router.get('/download/:id', fileController.downloadFile);

module.exports = router;
