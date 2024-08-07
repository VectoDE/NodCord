const Order = require('../../models/orderModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    const newOrder = new Order(orderData);
    await newOrder.save();

    const customerEmail = orderData.customer.email;
    await nodemailerService.sendOrderConfirmationEmail(
      customerEmail,
      `Order ID: ${newOrder._id}\nTotal Amount: ${
        newOrder.totalAmount
      }\nDetails: ${JSON.stringify(orderData.products)}`
    );

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
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'Shipped') {
      const customerEmail = updatedOrder.customer.email;
      await nodemailerService.sendShippingNotificationEmail(
        customerEmail,
        trackingNumber
      );
    }

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
      return res.status(404).json({ message: 'Order not found' });
    }

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
