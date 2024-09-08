const Product = require('../../models/productModel');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.listProducts = async (req, res) => {
  try {
    const products = await Product.find();
    logger.info('Fetched all products successfully');
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/products`, {
      success: true,
      data: products
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/products`, {
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !price) {
      logger.warn('Attempted to create product without required fields');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/products/create`, {
        success: false,
        message: 'Name and price are required'
      });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock,
    });

    await newProduct.save();
    logger.info('Product created successfully:', newProduct);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/products`, {
      success: true,
      data: newProduct
    });
  } catch (error) {
    logger.error('Error creating product:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/products/create`, {
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

exports.getProductDetails = async (req, res) => {
  const { productId } = req.params;

  try {
    if (!productId) {
      logger.warn('Product ID is required to fetch product details');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/products/${productId}`, {
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      logger.warn(`Product with ID ${productId} not found`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/products/${productId}`, {
        success: false,
        message: 'Product not found'
      });
    }

    logger.info(`Fetched details for product ID: ${productId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/products/${productId}`, {
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Error fetching product details:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/products/${productId}`, {
      success: false,
      message: 'Failed to fetch product details',
      error: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, category, stock } = req.body;

  try {
    if (!productId) {
      logger.warn('Product ID is required to update a product');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/products/${productId}/edit`, {
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      logger.warn(`Product with ID ${productId} not found`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/products/${productId}/edit`, {
        success: false,
        message: 'Product not found'
      });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock) product.stock = stock;

    product.updatedDate = Date.now();

    await product.save();
    logger.info(`Product updated successfully: ${productId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/products/${productId}`, {
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Error updating product:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/products/${productId}/edit`, {
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    if (!productId) {
      logger.warn('Product ID is required to delete a product');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/products`, {
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      logger.warn(`Product with ID ${productId} not found`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/products`, {
        success: false,
        message: 'Product not found'
      });
    }

    await product.remove();
    logger.info(`Product deleted successfully: ${productId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/products`, {
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting product:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/products`, {
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};
