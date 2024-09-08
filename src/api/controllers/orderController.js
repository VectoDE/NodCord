const Order = require('../../models/orderModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    if (!orderData.customer || !orderData.totalAmount || !orderData.products) {
      logger.warn('Invalid order data');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders/create`, {
        success: false,
        message: 'Invalid order data'
      });
    }

    const newOrder = new Order(orderData);
    await newOrder.save();

    const customerEmail = orderData.customer.email;
    await nodemailerService.sendOrderConfirmationEmail(
      customerEmail,
      `Order ID: ${newOrder._id}\nTotal Amount: ${newOrder.totalAmount}\nDetails: ${JSON.stringify(orderData.products)}`
    );

    logger.info(`Order created successfully: ${newOrder._id}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders/${newOrder._id}`, {
      success: true,
      data: newOrder
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders/create`, {
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status, trackingNumber } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status, trackingNumber },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      logger.warn(`Order not found for ID: ${orderId}`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders/${orderId}/update`, {
        success: false,
        message: 'Order not found'
      });
    }

    if (status === 'Shipped') {
      const customerEmail = updatedOrder.customer.email;
      await nodemailerService.sendShippingNotificationEmail(
        customerEmail,
        trackingNumber
      );
    }

    logger.info(`Order status updated successfully: ${orderId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders/${orderId}`, {
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    logger.error('Error updating order status:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders/${orderId}/update`, {
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

exports.getOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('products.product');

    if (!order) {
      logger.warn(`Order not found for ID: ${orderId}`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders/${orderId}`, {
        success: false,
        message: 'Order not found'
      });
    }

    logger.info(`Fetched order details: ${orderId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders/${orderId}`, {
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Error fetching order:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders/${orderId}`, {
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer')
      .populate('products.product');

    logger.info('Fetched all orders successfully');
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders`, {
      success: true,
      data: orders
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/orders`, {
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};
