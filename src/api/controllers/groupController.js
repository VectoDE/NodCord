require('dotenv').config();
const Group = require('../../models/groupModel');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');

exports.getAllGroups = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const groups = await Group.find(query).populate('members');
    logger.info('Fetched all groups:', { count: groups.length });

    const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      groups
    });
  } catch (err) {
    logger.error('Error fetching all groups:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching groups',
      error: err.message
    });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      logger.warn('Group ID is missing in get group by ID request:', { params: req.params });
      const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Group ID is required'
      });
    }

    const group = await Group.findById(groupId).populate('members');
    if (!group) {
      logger.warn('Group not found:', { groupId });
      const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Group not found'
      });
    }

    logger.info('Group fetched by ID:', { groupId });
    const redirectUrl = `${getBaseUrl()}/dashboard/groups/${groupId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      group
    });
  } catch (err) {
    logger.error('Error fetching group by ID:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching group details',
      error: err.message
    });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const group = new Group({ name, description, members });
    await group.save();

    logger.info('Group created successfully:', { groupId: group._id });
    const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Group created successfully',
      group
    });
  } catch (err) {
    logger.error('Error creating group:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/groups/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error creating group',
      error: err.message
    });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, members } = req.body;

    if (!groupId) {
      logger.warn('Group ID is missing in update group request:', { body: req.body });
      const redirectUrl = `${getBaseUrl()}/dashboard/groups/edit`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Group ID is required'
      });
    }

    const group = await Group.findByIdAndUpdate(groupId, { name, description, members }, { new: true });
    if (!group) {
      logger.warn('Group not found for update:', { groupId });
      const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Group not found'
      });
    }

    logger.info('Group updated successfully:', { groupId });
    const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Group updated successfully',
      group
    });
  } catch (err) {
    logger.error('Error updating group:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/groups/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error updating group',
      error: err.message
    });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      logger.warn('Group ID is missing in delete group request:', { params: req.params });
      const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Group ID is required'
      });
    }

    const group = await Group.findByIdAndDelete(groupId);
    if (!group) {
      logger.warn('Group not found for deletion:', { groupId });
      const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Group not found'
      });
    }

    logger.info('Group deleted successfully:', { groupId });
    const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (err) {
    logger.error('Error deleting group:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/groups`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error deleting group',
      error: err.message
    });
  }
};
