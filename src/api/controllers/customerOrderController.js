const Customer = require('../../models/customerModel');
const CustomerOrder = require('../../models/customerOrderModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

const createOrder = async (req, res) => {
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
      return res.status(400).json({
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
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const orderDetails = `Order Number: ${orderNumber}\nTotal Amount: ${totalAmount}\nShipping Address: ${shippingAddress}`;
    await nodemailerService.sendOrderConfirmationEmail(
      customer.email,
      orderDetails
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: newOrder,
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await CustomerOrder.find()
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price');
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const updatedOrder = await CustomerOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    if (status === 'Shipped') {
      const customer = await Customer.findById(updatedOrder.customerId);
      if (!customer) {
        return res.status(404).json({
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

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    logger.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await CustomerOrder.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully.',
    });
  } catch (error) {
    logger.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
