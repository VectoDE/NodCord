require('dotenv').config();
const Tag = require('../../models/tagModel');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');

exports.listTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    logger.info('Fetched tags:', { count: tags.length });
    const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      tags
    });
  } catch (error) {
    logger.error('Failed to list tags:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      logger.warn('Missing required field in create tag request:', { body: req.body });
      const redirectUrl = `${getBaseUrl()}/dashboard/tags/create`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Name is required'
      });
    }

    const newTag = new Tag({ name, description });
    await newTag.save();
    logger.info('Created new tag:', { id: newTag._id, name });
    const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Tag created successfully',
      tag: newTag
    });
  } catch (error) {
    logger.error('Failed to create tag:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tags/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error creating tag',
      error: error.message
    });
  }
};

exports.getTagDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      logger.warn('Tag ID is missing in get tag details request:', { params: req.params });
      const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Tag ID is required'
      });
    }

    const tag = await Tag.findById(id);
    if (!tag) {
      logger.warn('Tag not found:', { id });
      const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Tag not found'
      });
    }

    logger.info('Fetched tag details:', { id });
    const redirectUrl = `${getBaseUrl()}/dashboard/tags/${id}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      tag
    });
  } catch (error) {
    logger.error('Failed to get tag details:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching tag details',
      error: error.message
    });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { id, name, description } = req.body;
    if (!id) {
      logger.warn('Tag ID is missing in update tag request:', { body: req.body });
      const redirectUrl = `${getBaseUrl()}/dashboard/tags/edit`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Tag ID is required'
      });
    }

    const tag = await Tag.findById(id);
    if (!tag) {
      logger.warn('Tag not found for update:', { id });
      const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Tag not found'
      });
    }

    if (name) tag.name = name;
    if (description) tag.description = description;

    await tag.save();
    logger.info('Updated tag:', { id });
    const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Tag updated successfully',
      tag
    });
  } catch (error) {
    logger.error('Failed to update tag:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tags/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error updating tag',
      error: error.message
    });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      logger.warn('Tag ID is missing in delete tag request:', { body: req.body });
      const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Tag ID is required'
      });
    }

    const tag = await Tag.findById(id);
    if (!tag) {
      logger.warn('Tag not found for deletion:', { id });
      const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Tag not found'
      });
    }

    await tag.remove();
    logger.info('Deleted tag:', { id });
    const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete tag:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tags`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error deleting tag',
      error: error.message
    });
  }
};
