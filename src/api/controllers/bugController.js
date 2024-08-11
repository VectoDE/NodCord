const Bug = require('../../models/bugModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

const createBug = async (req, res) => {
  try {
    const { title, description, severity, status, project } = req.body;

    if (!title || !description || !severity || !status || !project) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newBug = new Bug({ title, description, severity, status, project });
    const savedBug = await newBug.save();

    res.status(201).json({
      message: 'Bug created successfully.',
      bug: savedBug,
    });
  } catch (error) {
    logger.error('Error creating bug:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
    });
  }
};

const getAllBugs = async (req, res) => {
  try {
    const bugs = await Bug.find().populate('project');
    res.status(200).json(bugs);
  } catch (error) {
    logger.error('Error fetching bugs:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
    });
  }
};

const getBugById = async (req, res) => {
  const { id } = req.params;

  try {
    const bug = await Bug.findById(id).populate('project');
    if (!bug) {
      return res.status(404).json({
        message: 'Bug not found.',
      });
    }
    res.status(200).json(bug);
  } catch (error) {
    logger.error(`Error fetching bug with ID ${id}:`, error);
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
    });
  }
};

const updateBug = async (req, res) => {
  const { id } = req.params;
  const { title, description, severity, status } = req.body;

  try {
    const updatedBug = await Bug.findByIdAndUpdate(
      id,
      { title, description, severity, status },
      { new: true, runValidators: true }
    );

    if (!updatedBug) {
      return res.status(404).json({
        message: 'Bug not found.',
      });
    }

    if (status === 'Resolved' || status === 'Closed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Bug "${updatedBug.title}" has been updated to ${status}.`
      );
    }

    res.status(200).json({
      message: 'Bug updated successfully.',
      bug: updatedBug,
    });
  } catch (error) {
    logger.error(`Error updating bug with ID ${id}:`, error);
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
    });
  }
};

const deleteBug = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBug = await Bug.findByIdAndDelete(id);
    if (!deletedBug) {
      return res.status(404).json({
        message: 'Bug not found.',
      });
    }
    res.status(200).json({
      message: 'Bug deleted successfully.',
    });
  } catch (error) {
    logger.error(`Error deleting bug with ID ${id}:`, error);
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
    });
  }
};

module.exports = {
  createBug,
  getAllBugs,
  getBugById,
  updateBug,
  deleteBug,
};
