const express = require('express');
const multer = require('multer');
const router = express.Router();
const googleController = require('../controllers/googleController');

const upload = multer({ dest: '../../public/uploads/' });

router.get('/google/files', googleController.listFiles);

router.post(
  '/google/upload',
  upload.single('file'),
  googleController.uploadFile
);

router.delete('/google/files/:fileId', googleController.deleteFile);

router.get('/google/files/:fileId/download', googleController.downloadFile);

module.exports = router;
