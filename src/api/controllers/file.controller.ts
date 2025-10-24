require('dotenv').config();
const path = require('path');
const fs = require('fs');
const File = require('../../models/fileModel');
const logger = require('../../services/logger.service');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      const redirectUrl = `${getBaseUrl()}/dashboard`;
      logger.warn('No file uploaded');
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileData = new File({
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    await fileData.save();

    const redirectUrl = `${getBaseUrl()}/dashboard`;
    logger.info('File uploaded successfully:', { filename: req.file.filename });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await File.findById(fileId);
    if (!file) {
      const redirectUrl = `${getBaseUrl()}/dashboard`;
      logger.warn('File not found:', { fileId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'File not found'
      });
    }

    logger.info('Fetched file metadata:', { fileId });
    const redirectUrl = `${getBaseUrl()}/dashboard/files/${fileId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      file
    });
  } catch (error) {
    logger.error('Error fetching file metadata:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.downloadFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await File.findById(fileId);
    if (!file) {
      const redirectUrl = `${getBaseUrl()}/dashboard`;
      logger.warn('File not found for download:', { fileId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'File not found'
      });
    }

    res.download(file.path, file.filename, (err) => {
      if (err) {
        logger.error('Error downloading file:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error'
        });
      }
    });
  } catch (error) {
    logger.error('Error downloading file:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
