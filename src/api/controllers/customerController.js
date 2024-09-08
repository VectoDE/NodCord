require('dotenv').config();
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');
const Customer = require('../../models/customerModel');

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      logger.warn('All fields are required during customer creation:', { name, email });
      const redirectUrl = `${getBaseUrl()}/dashboard/customers/create`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'All fields are required'
      });
    }

    const newCustomer = new Customer({ name, email, phone, address });
    await newCustomer.save();

    logger.info('Customer created successfully:', { name, email });
    const redirectUrl = `${getBaseUrl()}/dashboard/customers`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Customer created successfully',
      customer: newCustomer
    });
  } catch (error) {
    logger.error('Error creating customer:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/customers/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    logger.info('Fetched all customers:', { count: customers.length });

    const redirectUrl = `${getBaseUrl()}/dashboard/customers`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      customers
    });
  } catch (error) {
    logger.error('Error fetching customers:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/customers`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      logger.warn('Customer not found:', { customerId: req.params.customerId });
      const redirectUrl = `${getBaseUrl()}/dashboard/customers`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Customer not found'
      });
    }

    logger.info('Customer fetched by ID:', { customerId: req.params.customerId });
    const redirectUrl = `${getBaseUrl()}/dashboard/customers/editCustomer`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      customer
    });
  } catch (error) {
    logger.error('Error fetching customer by ID:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/customers`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const updates = { name, email, phone, address };
    const customer = await Customer.findByIdAndUpdate(req.params.customerId, updates, { new: true, runValidators: true });

    if (!customer) {
      logger.warn('Customer not found for update:', { customerId: req.params.customerId });
      const redirectUrl = `${getBaseUrl()}/dashboard/customers`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Customer not found'
      });
    }

    logger.info('Customer updated successfully:', { customerId: req.params.customerId });
    const redirectUrl = `${getBaseUrl()}/dashboard/customers`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    logger.error('Error updating customer:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/customers/editCustomer`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.customerId);
    if (!customer) {
      logger.warn('Customer not found for deletion:', { customerId: req.params.customerId });
      const redirectUrl = `${getBaseUrl()}/dashboard/customers`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Customer not found'
      });
    }

    logger.info('Customer deleted successfully:', { customerId: req.params.customerId });
    const redirectUrl = `${getBaseUrl()}/dashboard/customers`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting customer:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/customers`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};
