const Tag = require('../../models/tagModel');
const logger = require('../services/loggerService');

const listTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json(tags);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newTag = new Tag({
      name,
      description,
    });

    await newTag.save();
    res.status(201).json(newTag);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getTagDetails = async (req, res) => {
  try {
    const { tagId } = req.params;
    if (!tagId) {
      return res.status(400).json({ error: 'Tag ID is required' });
    }

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.status(200).json(tag);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const { tagId, name, description } = req.body;
    if (!tagId) {
      return res.status(400).json({ error: 'Tag ID is required' });
    }

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (name) tag.name = name;
    if (description) tag.description = description;

    await tag.save();
    res.status(200).json(tag);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    const { tagId } = req.body;
    if (!tagId) {
      return res.status(400).json({ error: 'Tag ID is required' });
    }

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await tag.remove();
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    logger.error(error);
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
