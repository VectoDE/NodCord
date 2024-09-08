const Return = require('../../models/returnModel');
const nodemailerService = require('../services/nodemailerService');
const CustomerOrder = require('../../models/customerOrderModel');
const Customer = require('../../models/customerModel');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.createReturn = async (req, res) => {
  try {
    const { orderId, returnNumber, reason, items } = req.body;

    if (!orderId || !returnNumber || !reason || !items) {
      logger.warn('Invalid input for creating return: Missing required fields');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns/create`, {
        success: false,
        message: 'All fields are required.'
      });
    }

    const order = await CustomerOrder.findById(orderId);
    if (!order) {
      logger.warn(`Order not found with ID: ${orderId}`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns/create`, {
        success: false,
        message: 'Order not found.'
      });
    }

    const newReturn = new Return({
      orderId,
      returnNumber,
      reason,
      items,
    });
    await newReturn.save();

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
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns`, {
      success: true,
      message: 'Return created successfully.',
      return: newReturn
    });
  } catch (error) {
    logger.error('Error creating return:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns/create`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getAllReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('orderId')
      .populate('items.productId');
    logger.info('Fetched all returns successfully');
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns`, {
      success: true,
      data: returns
    });
  } catch (error) {
    logger.error('Error fetching returns:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getReturnById = async (req, res) => {
  const { returnId } = req.params;

  try {
    const returnItem = await Return.findById(returnId)
      .populate('orderId')
      .populate('items.productId');
    if (!returnItem) {
      logger.warn(`Return not found with ID: ${returnId}`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns/${returnId}`, {
        success: false,
        message: 'Return not found.'
      });
    }
    logger.info(`Fetched return by ID: ${returnId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns/${returnId}`, {
      success: true,
      data: returnItem
    });
  } catch (error) {
    logger.error('Error fetching return:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns/${returnId}`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.updateReturn = async (req, res) => {
  const { returnId } = req.params;
  const { status } = req.body;

  try {
    if (!status) {
      logger.warn('Invalid input for updating return: Missing status');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns/${returnId}/edit`, {
        success: false,
        message: 'Status is required.'
      });
    }

    const updatedReturn = await Return.findByIdAndUpdate(
      returnId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedReturn) {
      logger.warn(`Return not found with ID: ${returnId}`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns/${returnId}/edit`, {
        success: false,
        message: 'Return not found.'
      });
    }

    logger.info(`Return updated successfully with ID: ${returnId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns/${returnId}`, {
      success: true,
      data: updatedReturn
    });
  } catch (error) {
    logger.error('Error updating return:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns/${returnId}/edit`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.deleteReturn = async (req, res) => {
  const { returnId } = req.params;

  try {
    const deletedReturn = await Return.findByIdAndDelete(returnId);
    if (!deletedReturn) {
      logger.warn(`Return not found with ID: ${returnId}`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns`, {
        success: false,
        message: 'Return not found.'
      });
    }
    logger.info(`Return deleted successfully with ID: ${returnId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns`, {
      success: true,
      message: 'Return deleted successfully.'
    });
  } catch (error) {
    logger.error('Error deleting return:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/returns`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
