const Category = require('../../models/categoryModel');
const logger = require('../services/loggerService');

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    logger.error('Error creating category:', error);
    res
      .status(400)
      .json({ error: 'Failed to create category', details: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch categories', details: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    logger.error(`Error fetching category with ID ${id}:`, error);
    res
      .status(500)
      .json({ error: 'Failed to fetch category', details: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    logger.error(`Error updating category with ID ${id}:`, error);
    res
      .status(400)
      .json({ error: 'Failed to update category', details: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting category with ID ${id}:`, error);
    res
      .status(500)
      .json({ error: 'Failed to delete category', details: error.message });
  }
};
