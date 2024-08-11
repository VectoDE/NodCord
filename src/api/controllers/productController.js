const Product = require('../../models/productModel');
const logger = require('../services/loggerService');

const listProducts = async (req, res) => {
  try {
    const products = await Product.find();
    logger.info('Fetched all products successfully');
    res.status(200).json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !price) {
      logger.warn('Attempted to create product without required fields');
      return res.status(400).json({ error: 'Name and price are required' });
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
    res.status(201).json(newProduct);
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      logger.warn('Product ID is required to fetch product details');
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      logger.warn(`Product with ID ${productId} not found`);
      return res.status(404).json({ error: 'Product not found' });
    }

    logger.info(`Fetched details for product ID: ${productId}`);
    res.status(200).json(product);
  } catch (error) {
    logger.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId, name, description, price, category, stock } = req.body;

    if (!productId) {
      logger.warn('Product ID is required to update a product');
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      logger.warn(`Product with ID ${productId} not found`);
      return res.status(404).json({ error: 'Product not found' });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock) product.stock = stock;

    product.updatedDate = Date.now();

    await product.save();
    logger.info(`Product updated successfully: ${productId}`);
    res.status(200).json(product);
  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      logger.warn('Product ID is required to delete a product');
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      logger.warn(`Product with ID ${productId} not found`);
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.remove();
    logger.info(`Product deleted successfully: ${productId}`);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

module.exports = {
  listProducts,
  createProduct,
  getProductDetails,
  updateProduct,
  deleteProduct,
};
