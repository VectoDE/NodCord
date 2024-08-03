const Order = require('../../models/orderModel');
const nodemailerService = require('../services/nodemailerService');

// Funktion zur Erstellung einer Bestellung
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Erstelle eine neue Bestellung
    const newOrder = new Order(orderData);
    await newOrder.save();

    // Sende eine Bestellbestätigungsmail
    const customerEmail = orderData.customer.email; // Assuming customer has an email field
    await nodemailerService.sendOrderConfirmationEmail(
      customerEmail,
      `Order ID: ${newOrder._id}\nTotal Amount: ${newOrder.totalAmount}\nDetails: ${JSON.stringify(orderData.products)}`
    );

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Funktion zur Aktualisierung des Bestellstatus (z.B. Versandbenachrichtigung)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    // Aktualisiere die Bestellung
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status, trackingNumber },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Sende eine Versandbenachrichtigungsmail, wenn der Status auf 'Shipped' geändert wird
    if (status === 'Shipped') {
      const customerEmail = updatedOrder.customer.email; // Assuming customer has an email field
      await nodemailerService.sendShippingNotificationEmail(
        customerEmail,
        trackingNumber
      );
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Funktion zum Abrufen einer Bestellung
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('customer').populate('products.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Funktion zum Abrufen aller Bestellungen
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer').populate('products.product');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrder,
  getAllOrders
};
