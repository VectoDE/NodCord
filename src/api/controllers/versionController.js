require('dotenv').config();
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');
const Version = require('../../models/versionModel');
const getBaseUrl = require('../helpers/getBaseUrlHelper');

exports.createVersion = async (req, res) => {
  try {
    const version = new Version(req.body);
    await version.save();

    logger.info('Version created successfully:', { versionId: version._id });

    const redirectUrl = `${getBaseUrl()}/dashboard/versions`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Version created successfully',
      data: version
    });
  } catch (err) {
    logger.error('Error creating version:', err);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/versions/create`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Error creating version',
      error: err.message
    });
  }
};

exports.getAllVersions = async (req, res) => {
  try {
    const versions = await Version.find();
    logger.info('Fetched all versions:', { count: versions.length });

    const redirectUrl = `${getBaseUrl()}/dashboard/versions`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      data: versions
    });
  } catch (err) {
    logger.error('Error fetching versions:', err);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/versions`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Error fetching versions',
      error: err.message
    });
  }
};

exports.getVersionById = async (req, res) => {
  try {
    const version = await Version.findById(req.params.versionId);
    if (!version) {
      logger.warn('Version not found:', { versionId: req.params.versionId });
      const notFoundRedirectUrl = `${getBaseUrl()}/dashboard/versions`;
      return sendResponse(req, res, notFoundRedirectUrl, {
        success: false,
        message: 'Version not found'
      });
    }

    logger.info('Version fetched by ID:', { versionId: req.params.versionId });
    const redirectUrl = `${getBaseUrl()}/dashboard/versions/${req.params.versionId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      data: version
    });
  } catch (err) {
    logger.error('Error fetching version by ID:', err);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/versions`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Error fetching version',
      error: err.message
    });
  }
};

exports.updateVersion = async (req, res) => {
  try {
    const version = await Version.findByIdAndUpdate(req.params.versionId, req.body, {
      new: true,
      runValidators: true
    });

    if (!version) {
      logger.warn('Version not found for update:', { versionId: req.params.versionId });
      const notFoundRedirectUrl = `${getBaseUrl()}/dashboard/versions`;
      return sendResponse(req, res, notFoundRedirectUrl, {
        success: false,
        message: 'Version not found'
      });
    }

    logger.info('Version updated successfully:', { versionId: req.params.versionId });
    const redirectUrl = `${getBaseUrl()}/dashboard/versions`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Version updated successfully',
      data: version
    });
  } catch (err) {
    logger.error('Error updating version:', err);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/versions/edit`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Error updating version',
      error: err.message
    });
  }
};

exports.deleteVersion = async (req, res) => {
  try {
    const version = await Version.findByIdAndDelete(req.params.versionId);
    if (!version) {
      logger.warn('Version not found for deletion:', { versionId: req.params.versionId });
      const notFoundRedirectUrl = `${getBaseUrl()}/dashboard/versions`;
      return sendResponse(req, res, notFoundRedirectUrl, {
        success: false,
        message: 'Version not found'
      });
    }

    logger.info('Version deleted successfully:', { versionId: req.params.versionId });
    const redirectUrl = `${getBaseUrl()}/dashboard/versions`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Version deleted successfully'
    });
  } catch (err) {
    logger.error('Error deleting version:', err);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/versions`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Error deleting version',
      error: err.message
    });
  }
};
