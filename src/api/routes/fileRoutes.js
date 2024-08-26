const express = require('express');
const router = express.Router();
const file = require('../utils/multerUtil');
const fileController = require('../controllers/fileController');

router.post('/upload', file.checkDiskSpaceMiddleware, file.upload, fileController.uploadFile);

router.get('/:id', fileController.getFile);

router.get('/download/:id', fileController.downloadFile);

module.exports = router;
