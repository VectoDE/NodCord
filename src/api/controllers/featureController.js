require('dotenv').config();
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');
const nodemailerService = require('../services/nodemailerService');
const Feature = require('../../models/featureModel');

exports.createFeature = async (req, res) => {
  try {
    const { title, description, status, priority, project } = req.body;

    if (!title || !description || !status || !priority || !project) {
      const redirectUrl = `${getBaseUrl()}/dashboard/features/create`;
      logger.warn('Missing required fields:', { title, description, status, priority, project });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Missing required fields.'
      });
    }

    const newFeature = new Feature({
      title,
      description,
      status,
      priority,
      project,
    });

    await newFeature.save();

    const redirectUrl = `${getBaseUrl()}/dashboard/features`;
    logger.info('Feature created successfully:', { title, description, status, priority, project });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Feature created successfully.',
      feature: newFeature,
    });
  } catch (error) {
    logger.error('Error creating feature:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/features/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getAllFeatures = async (req, res) => {
  try {
    const features = await Feature.find().populate('project');
    const redirectUrl = `${getBaseUrl()}/dashboard/features`;
    logger.info('Fetched all features:', { count: features.length });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      data: features,
    });
  } catch (error) {
    logger.error('Error fetching features:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/features`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getFeatureById = async (req, res) => {
  try {
    const featureId = req.params.featureId;
    const feature = await Feature.findById(featureId).populate('project');
    if (!feature) {
      const redirectUrl = `${getBaseUrl()}/dashboard/features/${featureId}`;
      logger.warn('Feature not found:', { featureId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Feature not found.'
      });
    }
    const redirectUrl = `${getBaseUrl()}/dashboard/features/${featureId}`;
    logger.info('Fetched feature by ID:', { featureId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      data: feature,
    });
  } catch (error) {
    logger.error('Error fetching feature:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/features/${req.params.featureId}`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.updateFeature = async (req, res) => {
  try {
    const featureId = req.params.featureId;
    const { title, description, status, priority } = req.body;

    if (!title && !description && !status && !priority) {
      const redirectUrl = `${getBaseUrl()}/dashboard/features/${featureId}/edit`;
      logger.warn('No fields to update:', { featureId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'No fields to update.'
      });
    }

    const updatedFeature = await Feature.findByIdAndUpdate(
      featureId,
      { title, description, status, priority },
      { new: true, runValidators: true }
    );

    if (!updatedFeature) {
      const redirectUrl = `${getBaseUrl()}/dashboard/features/${featureId}/edit`;
      logger.warn('Feature not found for update:', { featureId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Feature not found.'
      });
    }

    if (status === 'Completed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Feature ${updatedFeature.title} has been updated to ${status}.`
      );
    }

    const redirectUrl = `${getBaseUrl()}/dashboard/features/${featureId}`;
    logger.info('Feature updated successfully:', { featureId, status });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      data: updatedFeature,
    });
  } catch (error) {
    logger.error('Error updating feature:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/features/${req.params.featureId}/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.deleteFeature = async (req, res) => {
  try {
    const featureId = req.params.featureId;
    const deletedFeature = await Feature.findByIdAndDelete(featureId);
    if (!deletedFeature) {
      const redirectUrl = `${getBaseUrl()}/dashboard/features`;
      logger.warn('Feature not found for deletion:', { featureId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Feature not found.'
      });
    }
    const redirectUrl = `${getBaseUrl()}/dashboard/features`;
    logger.info('Feature deleted successfully:', { featureId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Feature deleted successfully.',
    });
  } catch (error) {
    logger.error('Error deleting feature:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/features`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
