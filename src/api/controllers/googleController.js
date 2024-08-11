const GoogleService = require('../services/googleService');
const logger = require('../services/loggerService');
const path = require('path');
const fs = require('fs');

const googleService = new GoogleService();

exports.listFiles = async (req, res) => {
  try {
    const files = await googleService.listFiles();
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    logger.error('Error listing files:', error);
    res.status(500).json({ success: false, message: 'Failed to list files' });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileId = await googleService.uploadFile(filePath);

    fs.unlinkSync(filePath);

    res.status(201).json({ success: true, fileId });
  } catch (error) {
    logger.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    await googleService.deleteFile(fileId);
    res.status(204).json();
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({ success: false, message: 'Failed to delete file' });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const destPath = path.join(__dirname, '../../public/downloads', fileId);

    if (!fs.existsSync(path.dirname(destPath))) {
      fs.mkdirSync(path.dirname(destPath));
    }

    await googleService.downloadFile(fileId, destPath);

    res.download(destPath, (err) => {
      if (err) {
        logger.error('Error downloading file:', err);
        res
          .status(500)
          .json({ success: false, message: 'Failed to download file' });
      } else {
        fs.unlinkSync(destPath);
      }
    });
  } catch (error) {
    logger.error('Error downloading file:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to download file' });
  }
};
