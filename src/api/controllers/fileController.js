const path = require('path');
const fs = require('fs');
const File = require('../../models/fileModel');
const logger = require('../services/loggerService');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileData = new File({
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    await fileData.save();

    req.flash('successMessage', 'File uploaded successfully');
    res.redirect(req.header('Referer') || '/');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(file.path, file.filename);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadFile,
  getFile,
  downloadFile,
};
