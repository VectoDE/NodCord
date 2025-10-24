const express = require('express');
const router = express.Router();
const file = require('../../services/multer.service');
const fileController = require('../controllers/fileController');

router.post('/upload', file.checkDiskSpaceMiddleware, file.upload, fileController.uploadFile);

router.get('/:fileId', fileController.getFile);

router.get('/:fileId/download', fileController.downloadFile);

module.exports = router;
