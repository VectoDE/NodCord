const Tag = require('../../models/tagModel');
const logger = require('../services/loggerService');

const listTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    logger.info('Fetched tags:', { count: tags.length });
    res.status(200).json(tags);
  } catch (error) {
    logger.error('Failed to list tags:', error);
    res.status(500).json({ error: error.message });
  }
};

const createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      logger.warn('Missing required field in create tag request:', {
        body: req.body,
      });
      return res.status(400).json({ error: 'Name is required' });
    }

    const newTag = new Tag({
      name,
      description,
    });

    await newTag.save();
    logger.info('Created new tag:', { tagId: newTag._id, name });
    res.status(201).json(newTag);
  } catch (error) {
    logger.error('Failed to create tag:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTagDetails = async (req, res) => {
  try {
    const { tagId } = req.params;
    if (!tagId) {
      logger.warn('Tag ID is missing in get tag details request:', {
        params: req.params,
      });
      return res.status(400).json({ error: 'Tag ID is required' });
    }

    const tag = await Tag.findById(tagId);
    if (!tag) {
      logger.warn('Tag not found:', { tagId });
      return res.status(404).json({ error: 'Tag not found' });
    }

    logger.info('Fetched tag details:', { tagId });
    res.status(200).json(tag);
  } catch (error) {
    logger.error('Failed to get tag details:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const { tagId, name, description } = req.body;
    if (!tagId) {
      logger.warn('Tag ID is missing in update tag request:', {
        body: req.body,
      });
      return res.status(400).json({ error: 'Tag ID is required' });
    }

    const tag = await Tag.findById(tagId);
    if (!tag) {
      logger.warn('Tag not found for update:', { tagId });
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (name) tag.name = name;
    if (description) tag.description = description;

    await tag.save();
    logger.info('Updated tag:', { tagId });
    res.status(200).json(tag);
  } catch (error) {
    logger.error('Failed to update tag:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    const { tagId } = req.body;
    if (!tagId) {
      logger.warn('Tag ID is missing in delete tag request:', {
        body: req.body,
      });
      return res.status(400).json({ error: 'Tag ID is required' });
    }

    const tag = await Tag.findById(tagId);
    if (!tag) {
      logger.warn('Tag not found for deletion:', { tagId });
      return res.status(404).json({ error: 'Tag not found' });
    }

    await tag.remove();
    logger.info('Deleted tag:', { tagId });
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete tag:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listTags,
  createTag,
  getTagDetails,
  updateTag,
  deleteTag,
};
