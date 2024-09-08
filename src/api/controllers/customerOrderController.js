require('dotenv').config();
const nodemailerService = require('../services/nodemailerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');
const Customer = require('../../models/customerModel');
const CustomerOrder = require('../../models/customerOrderModel');

exports.createOrder = async (req, res) => {
  try {
    const {
      customerId,
      orderNumber,
      items,
      totalAmount,
      shippingAddress,
      billingAddress,
    } = req.body;

    if (
      !customerId ||
      !orderNumber ||
      !items ||
      !totalAmount ||
      !shippingAddress ||
      !billingAddress
    ) {
      const redirectUrl = `${getBaseUrl()}/dashboard/orders/create`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Missing required fields',
      });
    }

    const newOrder = new CustomerOrder({
      customerId,
      orderNumber,
      items,
      totalAmount,
      shippingAddress,
      billingAddress,
    });

    await newOrder.save();

    const customer = await Customer.findById(customerId);
    if (!customer) {
      const redirectUrl = `${getBaseUrl()}/dashboard/orders/create`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Customer not found',
      });
    }

    const orderDetails = `Order Number: ${orderNumber}\nTotal Amount: ${totalAmount}\nShipping Address: ${shippingAddress}`;
    await nodemailerService.sendOrderConfirmationEmail(
      customer.email,
      orderDetails
    );

    const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Order created successfully.',
      order: newOrder,
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/orders/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await CustomerOrder.find()
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price');
    const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      orders,
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.customerOrderId)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price');
    if (!order) {
      const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Order not found.',
      });
    }
    const redirectUrl = `${getBaseUrl()}/dashboard/orders/${req.params.customerOrderId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      order,
    });
  } catch (error) {
    logger.error('Error fetching order:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      const redirectUrl = `${getBaseUrl()}/dashboard/orders/${req.params.customerOrderId}/edit`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Status is required',
      });
    }

    const updatedOrder = await CustomerOrder.findByIdAndUpdate(
      req.params.customerOrderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Order not found.',
      });
    }

    if (status === 'Shipped') {
      const customer = await Customer.findById(updatedOrder.customerId);
      if (!customer) {
        const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
        return sendResponse(req, res, redirectUrl, {
          success: false,
          message: 'Customer not found',
        });
      }
      const trackingNumber = 'TRACK12345'; // Ideally, this should be generated or fetched from a tracking system
      await nodemailerService.sendShippingNotificationEmail(
        customer.email,
        trackingNumber
      );
    }

    const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    logger.error('Error updating order:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/orders/${req.params.customerOrderId}/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await CustomerOrder.findByIdAndDelete(req.params.customerOrderId);
    if (!deletedOrder) {
      const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Order not found.',
      });
    }
    const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Order deleted successfully.',
    });
  } catch (error) {
    logger.error('Error deleting order:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/orders`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
