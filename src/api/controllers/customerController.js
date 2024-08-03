const Customer = require('../../models/customerModel');

// Erstelle einen neuen Customer
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const newCustomer = new Customer({ name, email, phone, address });
    await newCustomer.save();

    res.status(201).json({ message: 'Customer created successfully.', customer: newCustomer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Hol alle Customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Hol einen Customer nach ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update einen Customer
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
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Lösche einen Customer
const deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    res.status(200).json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
