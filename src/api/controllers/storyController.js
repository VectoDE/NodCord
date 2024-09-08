const Story = require('../../models/storyModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.createStory = async (req, res) => {
  try {
    const { title, description, status, priority, project } = req.body;

    if (!title || !description || !project) {
      logger.warn('Missing required fields in create story request:', { body: req.body });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories/create`, {
        success: false,
        message: 'Title, description, and project are required.'
      });
    }

    const newStory = new Story({ title, description, status, priority, project });
    await newStory.save();

    logger.info('Story created successfully:', { storyId: newStory._id, title });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories`, {
      success: true,
      message: 'Story created successfully.',
      story: newStory
    });
  } catch (error) {
    logger.error('Error creating story:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories/create`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().populate('project');
    logger.info('Fetched all stories:', { count: stories.length });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories`, {
      success: true,
      data: stories
    });
  } catch (error) {
    logger.error('Error fetching stories:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getStoryById = async (req, res) => {
  const { storyId } = req.params;

  try {
    const story = await Story.findById(storyId).populate('project');
    if (!story) {
      logger.warn('Story not found by ID:', { storyId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories/${storyId}`, {
        success: false,
        message: 'Story not found.'
      });
    }
    logger.info('Fetched story by ID:', { storyId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories/${storyId}`, {
      success: true,
      data: story
    });
  } catch (error) {
    logger.error('Error fetching story by ID:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories/${storyId}`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.updateStory = async (req, res) => {
  const { storyId } = req.params;
  const { title, description, status, priority } = req.body;

  try {
    if (!title && !description && !status && !priority) {
      logger.warn('No fields to update in update story request:', { body: req.body });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories/${storyId}/edit`, {
        success: false,
        message: 'At least one field is required to update.'
      });
    }

    const updatedStory = await Story.findByIdAndUpdate(
      storyId,
      { title, description, status, priority },
      { new: true, runValidators: true }
    );

    if (!updatedStory) {
      logger.warn('Story not found for update:', { storyId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories/${storyId}/edit`, {
        success: false,
        message: 'Story not found.'
      });
    }

    if (status === 'Completed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Story ${updatedStory.title} has been updated to ${status}.`
      );
      logger.info('Notification email sent for completed story:', {
        storyId: updatedStory._id,
        title: updatedStory.title
      });
    }

    logger.info('Story updated successfully:', {
      storyId: updatedStory._id,
      title: updatedStory.title
    });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories/${storyId}`, {
      success: true,
      data: updatedStory
    });
  } catch (error) {
    logger.error('Error updating story:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories/${storyId}/edit`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.deleteStory = async (req, res) => {
  const { storyId } = req.params;

  try {
    const deletedStory = await Story.findByIdAndDelete(storyId);
    if (!deletedStory) {
      logger.warn('Story not found for deletion:', { storyId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories`, {
        success: false,
        message: 'Story not found.'
      });
    }
    logger.info('Story deleted successfully:', { storyId: deletedStory._id });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories`, {
      success: true,
      message: 'Story deleted successfully.'
    });
  } catch (error) {
    logger.error('Error deleting story:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/stories`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
