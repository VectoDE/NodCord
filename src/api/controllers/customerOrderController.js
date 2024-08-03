const CustomerOrder = require('../../models/customerOrderModel');
const nodemailerService = require('../services/nodemailerService'); // Importiere den Nodemailer-Service

// Erstelle eine neue Bestellung
const createOrder = async (req, res) => {
  try {
    const { customerId, orderNumber, items, totalAmount, shippingAddress, billingAddress } = req.body;

    const newOrder = new CustomerOrder({
      customerId,
      orderNumber,
      items,
      totalAmount,
      shippingAddress,
      billingAddress
    });

    await newOrder.save();

    // Sende Bestellbestätigung per E-Mail
    const customer = await Customer.findById(customerId);
    const orderDetails = `Order Number: ${orderNumber}\nTotal Amount: ${totalAmount}\nShipping Address: ${shippingAddress}`;
    await nodemailerService.sendOrderConfirmationEmail(customer.email, orderDetails);

    res.status(201).json({ message: 'Order created successfully.', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Hole alle Bestellungen
const getAllOrders = async (req, res) => {
  try {
    const orders = await CustomerOrder.find().populate('customerId').populate('items.productId');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Hole eine Bestellung nach ID
const getOrderById = async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id).populate('customerId').populate('items.productId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update eine Bestellung
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

    // Wenn die Bestellung auf "Shipped" aktualisiert wird, sende eine Versandbenachrichtigung per E-Mail
    if (status === 'Shipped') {
      const customer = await Customer.findById(updatedOrder.customerId);
      const trackingNumber = 'TRACK12345'; // Hier sollte die tatsächliche Sendungsverfolgungsnummer verwendet werden
      await nodemailerService.sendShippingNotificationEmail(customer.email, trackingNumber);
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Lösche eine Bestellung
const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await CustomerOrder.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder
};
