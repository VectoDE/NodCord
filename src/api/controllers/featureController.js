const Feature = require('../../models/featureModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

const createFeature = async (req, res) => {
  try {
    const { title, description, status, priority, project } = req.body;

    if (!title || !description || !status || !priority || !project) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields.',
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

    res.status(201).json({
      success: true,
      message: 'Feature created successfully.',
      feature: newFeature,
    });
  } catch (error) {
    logger.error('Error creating feature:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const getAllFeatures = async (req, res) => {
  try {
    const features = await Feature.find().populate('project');
    res.status(200).json({
      success: true,
      data: features,
    });
  } catch (error) {
    logger.error('Error fetching features:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const getFeatureById = async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id).populate('project');
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found.',
      });
    }
    res.status(200).json({
      success: true,
      data: feature,
    });
  } catch (error) {
    logger.error('Error fetching feature:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const updateFeature = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    if (!title && !description && !status && !priority) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update.',
      });
    }

    const updatedFeature = await Feature.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority },
      { new: true, runValidators: true }
    );

    if (!updatedFeature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found.',
      });
    }

    if (status === 'Completed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Feature ${updatedFeature.title} has been updated to ${status}.`
      );
    }

    res.status(200).json({
      success: true,
      data: updatedFeature,
    });
  } catch (error) {
    logger.error('Error updating feature:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const deleteFeature = async (req, res) => {
  try {
    const deletedFeature = await Feature.findByIdAndDelete(req.params.id);
    if (!deletedFeature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found.',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Feature deleted successfully.',
    });
  } catch (error) {
    logger.error('Error deleting feature:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  createFeature,
  getAllFeatures,
  getFeatureById,
  updateFeature,
  deleteFeature,
};
