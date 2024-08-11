const Order = require('../../models/orderModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    if (!orderData.customer || !orderData.totalAmount || !orderData.products) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const newOrder = new Order(orderData);
    await newOrder.save();

    const customerEmail = orderData.customer.email;
    await nodemailerService.sendOrderConfirmationEmail(
      customerEmail,
      `Order ID: ${newOrder._id}\nTotal Amount: ${
        newOrder.totalAmount
      }\nDetails: ${JSON.stringify(orderData.products)}`
    );

    logger.info(`Order created successfully: ${newOrder._id}`);
    res.status(201).json(newOrder);
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status, trackingNumber },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      logger.warn(`Order not found for ID: ${orderId}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'Shipped') {
      const customerEmail = updatedOrder.customer.email;
      await nodemailerService.sendShippingNotificationEmail(
        customerEmail,
        trackingNumber
      );
    }

    logger.info(`Order status updated successfully: ${orderId}`);
    res.status(200).json(updatedOrder);
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('products.product');

    if (!order) {
      logger.warn(`Order not found for ID: ${orderId}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    logger.info(`Fetched order details: ${orderId}`);
    res.status(200).json(order);
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer')
      .populate('products.product');

    logger.info('Fetched all orders successfully');
    res.status(200).json(orders);
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrder,
  getAllOrders,
};
