const path = require('path');
const fs = require('fs');
const File = require('../../models/fileModel');
const logger = require('../services/loggerService');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'No file uploaded' });
    }

    const fileData = new File({
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    await fileData.save();

    res.redirect('/dashboard');
  } catch (error) {
    logger.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: 'File not found' });
    }

    res.status(200).json({ success: true, file });
  } catch (error) {
    logger.error('Error fetching file metadata:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: 'File not found' });
    }

    res.download(file.path, file.filename, (err) => {
      if (err) {
        logger.error('Error downloading file:', err);
        res
          .status(500)
          .json({ success: false, message: 'Internal Server Error' });
      }
    });
  } catch (error) {
    logger.error('Error downloading file:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  uploadFile,
  getFile,
  downloadFile,
};
