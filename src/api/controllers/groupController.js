const Group = require('../../models/groupModel');
const logger = require('../services/loggerService');

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('members');
    res.status(200).json({ success: true, data: groups });
  } catch (err) {
    logger.error('Error fetching all groups:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members');
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    }
    res.status(200).json({ success: true, data: group });
  } catch (err) {
    logger.error('Error fetching group by ID:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    res.status(201).json({ success: true, data: group });
  } catch (err) {
    logger.error('Error creating group:', err);
    res
      .status(400)
      .json({ success: false, message: 'Bad Request', details: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    }
    res.status(200).json({ success: true, data: group });
  } catch (err) {
    logger.error('Error updating group:', err);
    res
      .status(400)
      .json({ success: false, message: 'Bad Request', details: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Group deleted successfully' });
  } catch (err) {
    logger.error('Error deleting group:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
