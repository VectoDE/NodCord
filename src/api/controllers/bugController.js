require('dotenv').config();
const Bug = require('../../models/bugModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.createBug = async (req, res) => {
  try {
    const { title, description, severity, status, project } = req.body;

    if (!title || !description || !severity || !status || !project) {
      const redirectUrl = `${getBaseUrl()}/dashboard/bugs/create`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'All fields are required'
      });
    }

    const newBug = new Bug({ title, description, severity, status, project });
    const savedBug = await newBug.save();

    logger.info('Bug created successfully:', { bugId: savedBug._id });

    const redirectUrl = `${getBaseUrl()}/dashboard/bugs`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Bug created successfully.',
      bug: savedBug
    });
  } catch (error) {
    logger.error('Error creating bug:', error);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/bugs/create`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getAllBugs = async (req, res) => {
  try {
    const bugs = await Bug.find().populate('project');
    logger.info('Fetched all bugs:', { count: bugs.length });

    const redirectUrl = `${getBaseUrl()}/dashboard/bugs`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      bugs
    });
  } catch (error) {
    logger.error('Error fetching bugs:', error);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/bugs`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getBugById = async (req, res) => {
  const { bugId } = req.params;

  try {
    const bug = await Bug.findById(bugId).populate('project');
    if (!bug) {
      logger.warn('Bug not found:', { bugId });
      const notFoundRedirectUrl = `${getBaseUrl()}/dashboard/bugs`;
      return sendResponse(req, res, notFoundRedirectUrl, {
        success: false,
        message: 'Bug not found.'
      });
    }

    logger.info('Fetched bug details:', { bugId });
    const redirectUrl = `${getBaseUrl()}/dashboard/bugs/${bugId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      bug
    });
  } catch (error) {
    logger.error(`Error fetching bug with ID ${bugId}:`, error);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/bugs`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.updateBug = async (req, res) => {
  const { bugId } = req.params;
  const { title, description, severity, status } = req.body;

  try {
    const updatedBug = await Bug.findByIdAndUpdate(
      bugId,
      { title, description, severity, status },
      { new: true, runValidators: true }
    );

    if (!updatedBug) {
      logger.warn('Bug not found for update:', { bugId });
      const notFoundRedirectUrl = `${getBaseUrl()}/dashboard/bugs`;
      return sendResponse(req, res, notFoundRedirectUrl, {
        success: false,
        message: 'Bug not found.'
      });
    }

    if (status === 'Resolved' || status === 'Closed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Bug "${updatedBug.title}" has been updated to ${status}.`
      );
    }

    logger.info('Bug updated successfully:', { bugId });
    const redirectUrl = `${getBaseUrl()}/dashboard/bugs`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Bug updated successfully.',
      bug: updatedBug
    });
  } catch (error) {
    logger.error(`Error updating bug with ID ${bugId}:`, error);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/bugs/edit/${bugId}`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.deleteBug = async (req, res) => {
  const { bugId } = req.params;

  try {
    const deletedBug = await Bug.findByIdAndDelete(bugId);
    if (!deletedBug) {
      logger.warn('Bug not found for deletion:', { bugId });
      const notFoundRedirectUrl = `${getBaseUrl()}/dashboard/bugs`;
      return sendResponse(req, res, notFoundRedirectUrl, {
        success: false,
        message: 'Bug not found.'
      });
    }

    logger.info('Bug deleted successfully:', { bugId });
    const redirectUrl = `${getBaseUrl()}/dashboard/bugs`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Bug deleted successfully.'
    });
  } catch (error) {
    logger.error(`Error deleting bug with ID ${bugId}:`, error);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/bugs`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
