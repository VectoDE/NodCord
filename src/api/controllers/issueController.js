const Issue = require('../../models/issueModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

const createIssue = async (req, res) => {
  try {
    const { title, description, status, project } = req.body;

    if (!title || !description || !project) {
      return res
        .status(400)
        .json({ message: 'Title, description, and project are required.' });
    }

    const newIssue = new Issue({ title, description, status, project });
    await newIssue.save();

    res
      .status(201)
      .json({ message: 'Issue created successfully.', issue: newIssue });
  } catch (error) {
    logger.error('Error creating issue:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().populate('project');
    res.status(200).json(issues);
  } catch (error) {
    logger.error('Error fetching issues:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('project');
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }
    res.status(200).json(issue);
  } catch (error) {
    logger.error(`Error fetching issue with ID ${req.params.id}:`, error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

const updateIssue = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title && !description && !status) {
      return res
        .status(400)
        .json({
          message:
            'At least one field (title, description, status) is required for update.',
        });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { title, description, status },
      { new: true, runValidators: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    if (status === 'Resolved' || status === 'Closed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Issue ${updatedIssue.title} has been updated to ${status}.`
      );
    }

    res.status(200).json(updatedIssue);
  } catch (error) {
    logger.error(`Error updating issue with ID ${req.params.id}:`, error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
    if (!deletedIssue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }
    res.status(200).json({ message: 'Issue deleted successfully.' });
  } catch (error) {
    logger.error(`Error deleting issue with ID ${req.params.id}:`, error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};