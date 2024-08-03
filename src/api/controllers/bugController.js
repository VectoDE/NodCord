const Bug = require('../../models/bugModel');
const nodemailerService = require('../services/nodemailerService');

// Erstelle einen neuen Bug
const createBug = async (req, res) => {
  try {
    const { title, description, severity, status, project } = req.body;

    const newBug = new Bug({ title, description, severity, status, project });
    await newBug.save();

    res.status(201).json({ message: 'Bug created successfully.', bug: newBug });
  } catch (error) {
    console.error('Error creating bug:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Hol alle Bugs
const getAllBugs = async (req, res) => {
  try {
    const bugs = await Bug.find().populate('project');
    res.status(200).json(bugs);
  } catch (error) {
    console.error('Error fetching bugs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Hol einen Bug nach ID
const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id).populate('project');
    if (!bug) {
      return res.status(404).json({ message: 'Bug not found.' });
    }
    res.status(200).json(bug);
  } catch (error) {
    console.error('Error fetching bug:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update einen Bug
const updateBug = async (req, res) => {
  try {
    const { title, description, severity, status } = req.body;
    const updatedBug = await Bug.findByIdAndUpdate(
      req.params.id,
      { title, description, severity, status },
      { new: true, runValidators: true }
    );

    if (!updatedBug) {
      return res.status(404).json({ message: 'Bug not found.' });
    }

    // Optional: Sende E-Mail-Benachrichtigung bei Statusänderung
    if (status === 'Resolved' || status === 'Closed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Bug ${updatedBug.title} has been updated to ${status}.`
      );
    }

    res.status(200).json(updatedBug);
  } catch (error) {
    console.error('Error updating bug:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Lösche einen Bug
const deleteBug = async (req, res) => {
  try {
    const deletedBug = await Bug.findByIdAndDelete(req.params.id);
    if (!deletedBug) {
      return res.status(404).json({ message: 'Bug not found.' });
    }
    res.status(200).json({ message: 'Bug deleted successfully.' });
  } catch (error) {
    console.error('Error deleting bug:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createBug,
  getAllBugs,
  getBugById,
  updateBug,
  deleteBug
};
