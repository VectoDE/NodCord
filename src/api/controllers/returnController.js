const Return = require('../../models/returnModel');
const nodemailerService = require('../services/nodemailerService');
const CustomerOrder = require('../../models/customerOrderModel');
const Customer = require('../../models/customerModel');
const logger = require('../services/loggerService');

// Create a new return
const createReturn = async (req, res) => {
  try {
    const { orderId, returnNumber, reason, items } = req.body;

    // Validate input
    if (!orderId || !returnNumber || !reason || !items) {
      logger.warn('Invalid input for creating return: Missing required fields');
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the order exists
    const order = await CustomerOrder.findById(orderId);
    if (!order) {
      logger.warn(`Order not found with ID: ${orderId}`);
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Create and save the return
    const newReturn = new Return({
      orderId,
      returnNumber,
      reason,
      items,
    });
    await newReturn.save();

    // Send notification email
    const customer = await Customer.findById(order.customerId);
    if (customer) {
      const returnDetails = `Return Number: ${returnNumber}\nReason: ${reason}`;
      await nodemailerService.sendReturnOrderEmail(
        customer.email,
        returnDetails
      );
      logger.info(`Return email sent to ${customer.email}`);
    } else {
      logger.warn(`Customer not found for Order ID: ${orderId}`);
    }

    logger.info(`Return created successfully with ID: ${newReturn._id}`);
    res
      .status(201)
      .json({ message: 'Return created successfully.', return: newReturn });
  } catch (error) {
    logger.error('Error creating return:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all returns
const getAllReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('orderId')
      .populate('items.productId');
    logger.info('Fetched all returns successfully');
    res.status(200).json(returns);
  } catch (error) {
    logger.error('Error fetching returns:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get a return by ID
const getReturnById = async (req, res) => {
  try {
    const returnItem = await Return.findById(req.params.id)
      .populate('orderId')
      .populate('items.productId');
    if (!returnItem) {
      logger.warn(`Return not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Return not found.' });
    }
    logger.info(`Fetched return by ID: ${req.params.id}`);
    res.status(200).json(returnItem);
  } catch (error) {
    logger.error('Error fetching return:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update a return
const updateReturn = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      logger.warn('Invalid input for updating return: Missing status');
      return res.status(400).json({ message: 'Status is required.' });
    }

    const updatedReturn = await Return.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedReturn) {
      logger.warn(`Return not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Return not found.' });
    }

    logger.info(`Return updated successfully with ID: ${req.params.id}`);
    res.status(200).json(updatedReturn);
  } catch (error) {
    logger.error('Error updating return:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a return
const deleteReturn = async (req, res) => {
  try {
    const deletedReturn = await Return.findByIdAndDelete(req.params.id);
    if (!deletedReturn) {
      logger.warn(`Return not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Return not found.' });
    }
    logger.info(`Return deleted successfully with ID: ${req.params.id}`);
    res.status(200).json({ message: 'Return deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting return:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createReturn,
  getAllReturns,
  getReturnById,
  updateReturn,
  deleteReturn,
};
