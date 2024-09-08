require('dotenv').config();
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');
const DeveloperProgram = require('../../models/developerProgramModel');
const nodemailerService = require('../services/nodemailerService');

exports.joinDeveloperProgram = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email;
    const username = req.user?.username;

    if (!userId || !userEmail || !username) {
      const redirectUrl = `${getBaseUrl()}/dashboard/developer-program/join`;
      logger.warn('User information is missing:', { userId, userEmail, username });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'User information is missing',
      });
    }

    let developerProgram = await DeveloperProgram.findOne({ userId });

    if (!developerProgram) {
      developerProgram = new DeveloperProgram({ userId, isActive: true });
    } else {
      developerProgram.isActive = true;
    }

    await developerProgram.save();

    await nodemailerService.sendDeveloperProgramJoinEmail(userEmail, username);

    const redirectUrl = `${getBaseUrl()}/dashboard/developer-program`;
    logger.info('Successfully joined developer program:', { userId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Successfully joined developer program',
    });
  } catch (error) {
    logger.error('Error joining developer program:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/developer-program/join`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

exports.leaveDeveloperProgram = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email;
    const username = req.user?.username;

    if (!userId || !userEmail || !username) {
      const redirectUrl = `${getBaseUrl()}/dashboard/developer-program/leave`;
      logger.warn('User information is missing:', { userId, userEmail, username });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'User information is missing',
      });
    }

    const developerProgram = await DeveloperProgram.findOneAndUpdate(
      { userId },
      { isActive: false },
      { new: true }
    );

    if (!developerProgram) {
      const redirectUrl = `${getBaseUrl()}/dashboard/developer-program`;
      logger.warn('Developer Program not found:', { userId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Developer Program not found',
      });
    }

    await nodemailerService.sendDeveloperProgramLeaveEmail(userEmail, username);

    const redirectUrl = `${getBaseUrl()}/dashboard/developer-program`;
    logger.info('Successfully left developer program:', { userId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Successfully left developer program',
    });
  } catch (error) {
    logger.error('Error leaving developer program:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/developer-program/leave`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
