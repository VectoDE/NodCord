require('dotenv').config();
const Category = require('../../models/categoryModel');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();

    logger.info('Category created successfully:', { categoryId: savedCategory._id });
    const redirectUrl = `${getBaseUrl()}/dashboard/categories`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Category created successfully',
      category: savedCategory
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/categories/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    logger.info('Fetched categories:', { count: categories.length });
    const redirectUrl = `${getBaseUrl()}/dashboard/categories`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      categories
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/categories`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

exports.getCategoryById = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      logger.warn('Category not found:', { categoryId });
      const redirectUrl = `${getBaseUrl()}/dashboard/categories`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Category not found'
      });
    }

    logger.info('Category fetched by ID:', { categoryId });
    const redirectUrl = `${getBaseUrl()}/dashboard/categories/${categoryId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      category
    });
  } catch (error) {
    logger.error(`Error fetching category with ID ${categoryId}:`, error);
    const redirectUrl = `${getBaseUrl()}/dashboard/categories`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

exports.updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const updateData = req.body;

  try {
    const category = await Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      logger.warn('Category not found for update:', { categoryId });
      const redirectUrl = `${getBaseUrl()}/dashboard/categories`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Category not found'
      });
    }

    logger.info('Category updated successfully:', { categoryId });
    const redirectUrl = `${getBaseUrl()}/dashboard/categories`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    logger.error(`Error updating category with ID ${categoryId}:`, error);
    const redirectUrl = `${getBaseUrl()}/dashboard/categories/edit/${categoryId}`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

exports.deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      logger.warn('Category not found for deletion:', { categoryId });
      const redirectUrl = `${getBaseUrl()}/dashboard/categories`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Category not found'
      });
    }

    logger.info('Category deleted successfully:', { categoryId });
    const redirectUrl = `${getBaseUrl()}/dashboard/categories`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting category with ID ${categoryId}:`, error);
    const redirectUrl = `${getBaseUrl()}/dashboard/categories`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};
