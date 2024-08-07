const Customer = require('../../models/customerModel');
const logger = require('../services/loggerService');

const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const newCustomer = new Customer({ name, email, phone, address });
    await newCustomer.save();

    res
      .status(201)
      .json({
        message: 'Customer created successfully.',
        customer: newCustomer,
      });
  } catch (error) {
    logger.error('Error creating customer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    logger.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    res.status(200).json(customer);
  } catch (error) {
    logger.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json(updatedCustomer);
  } catch (error) {
    logger.error('Error updating customer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    res.status(200).json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
