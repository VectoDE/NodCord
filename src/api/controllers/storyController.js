const Story = require('../../models/storyModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

const createStory = async (req, res) => {
  try {
    const { title, description, status, priority, project } = req.body;

    if (!title || !description || !project) {
      logger.warn('Missing required fields in create story request:', {
        body: req.body,
      });
      return res
        .status(400)
        .json({ message: 'Title, description, and project are required.' });
    }

    const newStory = new Story({
      title,
      description,
      status,
      priority,
      project,
    });
    await newStory.save();

    logger.info('Story created successfully:', {
      storyId: newStory._id,
      title,
    });
    res
      .status(201)
      .json({ message: 'Story created successfully.', story: newStory });
  } catch (error) {
    logger.error('Error creating story:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().populate('project');
    logger.info('Fetched all stories:', { count: stories.length });
    res.status(200).json(stories);
  } catch (error) {
    logger.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('project');
    if (!story) {
      logger.warn('Story not found by ID:', { id: req.params.id });
      return res.status(404).json({ message: 'Story not found.' });
    }
    logger.info('Fetched story by ID:', { id: req.params.id });
    res.status(200).json(story);
  } catch (error) {
    logger.error('Error fetching story by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateStory = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    if (!title && !description && !status && !priority) {
      logger.warn('No fields to update in update story request:', {
        body: req.body,
      });
      return res
        .status(400)
        .json({ message: 'At least one field is required to update.' });
    }

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority },
      { new: true, runValidators: true }
    );

    if (!updatedStory) {
      logger.warn('Story not found for update:', { id: req.params.id });
      return res.status(404).json({ message: 'Story not found.' });
    }

    if (status === 'Completed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Story ${updatedStory.title} has been updated to ${status}.`
      );
      logger.info('Notification email sent for completed story:', {
        storyId: updatedStory._id,
        title: updatedStory.title,
      });
    }

    logger.info('Story updated successfully:', {
      storyId: updatedStory._id,
      title: updatedStory.title,
    });
    res.status(200).json(updatedStory);
  } catch (error) {
    logger.error('Error updating story:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteStory = async (req, res) => {
  try {
    const deletedStory = await Story.findByIdAndDelete(req.params.id);
    if (!deletedStory) {
      logger.warn('Story not found for deletion:', { id: req.params.id });
      return res.status(404).json({ message: 'Story not found.' });
    }
    logger.info('Story deleted successfully:', { storyId: deletedStory._id });
    res.status(200).json({ message: 'Story deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting story:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory,
};
