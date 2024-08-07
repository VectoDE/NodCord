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
    const orderDetails = `Order Number: ${orderNumber}\nTotal Amount: ${totalAmount}\nShipping Address: ${shippingAddress}`;
    await nodemailerService.sendOrderConfirmationEmail(
      customer.email,
      orderDetails
    );

    res
      .status(201)
      .json({ message: 'Order created successfully.', order: newOrder });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await CustomerOrder.find()
      .populate('customerId')
      .populate('items.productId');
    res.status(200).json(orders);
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id)
      .populate('customerId')
      .populate('items.productId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await CustomerOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (status === 'Shipped') {
      const customer = await Customer.findById(updatedOrder.customerId);
      const trackingNumber = 'TRACK12345';
      await nodemailerService.sendShippingNotificationEmail(
        customer.email,
        trackingNumber
      );
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    logger.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await CustomerOrder.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
