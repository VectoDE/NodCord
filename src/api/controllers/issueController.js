const Issue = require('../../models/issueModel');
const nodemailerService = require('../services/nodemailerService');

// Erstelle ein neues Issue
const createIssue = async (req, res) => {
  try {
    const { title, description, status, project } = req.body;

    const newIssue = new Issue({ title, description, status, project });
    await newIssue.save();

    res.status(201).json({ message: 'Issue created successfully.', issue: newIssue });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Hol alle Issues
const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().populate('project');
    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Hol ein Issue nach ID
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('project');
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }
    res.status(200).json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update ein Issue
const updateIssue = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { title, description, status },
      { new: true, runValidators: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    // Optional: Sende E-Mail-Benachrichtigung bei Statusänderung
    if (status === 'Resolved' || status === 'Closed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Issue ${updatedIssue.title} has been updated to ${status}.`
      );
    }

    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Lösche ein Issue
const deleteIssue = async (req, res) => {
  try {
    const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
    if (!deletedIssue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }
    res.status(200).json({ message: 'Issue deleted successfully.' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue
};
