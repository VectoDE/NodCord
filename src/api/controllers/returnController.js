const Return = require('../../models/returnModel');
const nodemailerService = require('../services/nodemailerService');
const CustomerOrder = require('../../models/customerOrderModel');
const logger = require('../services/loggerService');

const createReturn = async (req, res) => {
  try {
    const { orderId, returnNumber, reason, items } = req.body;

    const order = await CustomerOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const newReturn = new Return({
      orderId,
      returnNumber,
      reason,
      items,
    });

    await newReturn.save();

    const customer = await Customer.findById(order.customerId);
    const returnDetails = `Return Number: ${returnNumber}\nReason: ${reason}`;
    await nodemailerService.sendReturnOrderEmail(customer.email, returnDetails);

    res
      .status(201)
      .json({ message: 'Return created successfully.', return: newReturn });
  } catch (error) {
    logger.error('Error creating return:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('orderId')
      .populate('items.productId');
    res.status(200).json(returns);
  } catch (error) {
    logger.error('Error fetching returns:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getReturnById = async (req, res) => {
  try {
    const returnItem = await Return.findById(req.params.id)
      .populate('orderId')
      .populate('items.productId');
    if (!returnItem) {
      return res.status(404).json({ message: 'Return not found.' });
    }
    res.status(200).json(returnItem);
  } catch (error) {
    logger.error('Error fetching return:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateReturn = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedReturn = await Return.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedReturn) {
      return res.status(404).json({ message: 'Return not found.' });
    }

    res.status(200).json(updatedReturn);
  } catch (error) {
    logger.error('Error updating return:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteReturn = async (req, res) => {
  try {
    const deletedReturn = await Return.findByIdAndDelete(req.params.id);
    if (!deletedReturn) {
      return res.status(404).json({ message: 'Return not found.' });
    }
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
