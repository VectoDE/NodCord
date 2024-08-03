const Story = require('../../models/storyModel');
const nodemailerService = require('../services/nodemailerService');

// Erstelle eine neue Story
const createStory = async (req, res) => {
  try {
    const { title, description, status, priority, project } = req.body;

    const newStory = new Story({ title, description, status, priority, project });
    await newStory.save();

    res.status(201).json({ message: 'Story created successfully.', story: newStory });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Hol alle Stories
const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().populate('project');
    res.status(200).json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Hol eine Story nach ID
const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('project');
    if (!story) {
      return res.status(404).json({ message: 'Story not found.' });
    }
    res.status(200).json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update eine Story
const updateStory = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority },
      { new: true, runValidators: true }
    );

    if (!updatedStory) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    // Optional: Sende E-Mail-Benachrichtigung bei Statusänderung
    if (status === 'Completed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Story ${updatedStory.title} has been updated to ${status}.`
      );
    }

    res.status(200).json(updatedStory);
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Lösche eine Story
const deleteStory = async (req, res) => {
  try {
    const deletedStory = await Story.findByIdAndDelete(req.params.id);
    if (!deletedStory) {
      return res.status(404).json({ message: 'Story not found.' });
    }
    res.status(200).json({ message: 'Story deleted successfully.' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory
};
