require('dotenv').config();
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const Issue = require('../../models/issueModel');

exports.createIssue = async (req, res) => {
  try {
    const { title, description, status, project } = req.body;

    if (!title || !description || !project) {
      logger.warn('Missing required fields during issue creation:', { title, description, project });
      const redirectUrl = `${getBaseUrl()}/issues/create`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Title, description, and project are required'
      });
    }

    const newIssue = new Issue({ title, description, status, project });
    await newIssue.save();

    logger.info('Issue created successfully:', { issueId: newIssue._id });
    const redirectUrl = `${getBaseUrl()}/issues/${newIssue._id}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Issue created successfully',
      issue: newIssue
    });
  } catch (error) {
    logger.error('Error creating issue:', error);
    const redirectUrl = `${getBaseUrl()}/issues/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to create issue',
      error: error.message
    });
  }
};

exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().populate('project');
    logger.info('Fetched all issues successfully');
    const redirectUrl = `${getBaseUrl()}/issues`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      issues
    });
  } catch (error) {
    logger.error('Error fetching issues:', error);
    const redirectUrl = `${getBaseUrl()}/issues`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to fetch issues',
      error: error.message
    });
  }
};

exports.getIssueById = async (req, res) => {
  const { issueId } = req.params;

  try {
    const issue = await Issue.findById(issueId).populate('project');

    if (!issue) {
      logger.warn('Issue not found:', { issueId });
      const redirectUrl = `${getBaseUrl()}/issues`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Issue not found'
      });
    }

    logger.info('Fetched issue by ID:', { issueId });
    const redirectUrl = `${getBaseUrl()}/issues/${issueId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      issue
    });
  } catch (error) {
    logger.error(`Error fetching issue with ID ${issueId}:`, error);
    const redirectUrl = `${getBaseUrl()}/issues`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to fetch issue',
      error: error.message
    });
  }
};

exports.updateIssue = async (req, res) => {
  const { issueId } = req.params;
  const { title, description, status } = req.body;

  try {
    if (!title && !description && !status) {
      logger.warn('No fields provided for update:', { issueId });
      const redirectUrl = `${getBaseUrl()}/issues/edit/${issueId}`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'At least one field (title, description, status) is required for update'
      });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { title, description, status },
      { new: true, runValidators: true }
    );

    if (!updatedIssue) {
      logger.warn('Issue not found for update:', { issueId });
      const redirectUrl = `${getBaseUrl()}/issues`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Issue not found'
      });
    }

    if (status === 'Resolved' || status === 'Closed') {
      await nodemailerService.sendProjectStatusUpdateEmail(
        'project-manager@example.com',
        `Issue ${updatedIssue.title} has been updated to ${status}.`
      );
    }

    logger.info('Issue updated successfully:', { issueId });
    const redirectUrl = `${getBaseUrl()}/issues/${issueId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Issue updated successfully',
      issue: updatedIssue
    });
  } catch (error) {
    logger.error(`Error updating issue with ID ${issueId}:`, error);
    const redirectUrl = `${getBaseUrl()}/issues/edit/${issueId}`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to update issue',
      error: error.message
    });
  }
};

exports.deleteIssue = async (req, res) => {
  const { issueId } = req.params;

  try {
    const deletedIssue = await Issue.findByIdAndDelete(issueId);
    if (!deletedIssue) {
      logger.warn('Issue not found for deletion:', { issueId });
      const redirectUrl = `${getBaseUrl()}/issues`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Issue not found'
      });
    }

    logger.info('Issue deleted successfully:', { issueId });
    const redirectUrl = `${getBaseUrl()}/issues`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting issue with ID ${issueId}:`, error);
    const redirectUrl = `${getBaseUrl()}/issues`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to delete issue',
      error: error.message
    });
  }
};
