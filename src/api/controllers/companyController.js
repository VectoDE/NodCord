require('dotenv').config();
const Company = require('../../models/companyModel');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');

exports.listCompanies = async (req, res) => {
  try {
    const companies = await Company.find();

    logger.info('Fetched all companies:', { count: companies.length });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
      success: true,
      companies
    });
  } catch (error) {
    logger.error('Error listing companies:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const {
      name,
      description,
      industry,
      headquarters,
      foundedDate,
      employees,
      website
    } = req.body;

    if (!name) {
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies/create`, {
        success: false,
        message: 'Name is required'
      });
    }

    const newCompany = new Company({
      name,
      description,
      industry,
      headquarters,
      foundedDate,
      employees,
      website
    });

    const savedCompany = await newCompany.save();

    logger.info('Company created successfully:', { companyId: savedCompany._id });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
      success: true,
      message: 'Company created successfully',
      company: savedCompany
    });
  } catch (error) {
    logger.error('Error creating company:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies/create`, {
      success: false,
      message: 'Failed to create company',
      error: error.message
    });
  }
};

exports.getCompanyDetails = async (req, res) => {
  const { companyId } = req.params;

  try {
    if (!companyId) {
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
        success: false,
        message: 'Company ID is required'
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      logger.warn('Company not found:', { companyId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
        success: false,
        message: 'Company not found'
      });
    }

    logger.info('Fetched company details:', { companyId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies/${companyId}`, {
      success: true,
      company
    });
  } catch (error) {
    logger.error(`Error fetching company details with ID ${companyId}:`, error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
      success: false,
      message: 'Failed to fetch company details',
      error: error.message
    });
  }
};

exports.updateCompany = async (req, res) => {
  const { companyId } = req.params;
  const updateData = req.body;

  try {
    if (!companyId) {
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
        success: false,
        message: 'Company ID is required'
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      logger.warn('Company not found for update:', { companyId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
        success: false,
        message: 'Company not found'
      });
    }

    Object.assign(company, updateData);
    company.updatedDate = Date.now();

    const updatedCompany = await company.save();

    logger.info('Company updated successfully:', { companyId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
      success: true,
      message: 'Company updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    logger.error(`Error updating company with ID ${companyId}:`, error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies/edit/${companyId}`, {
      success: false,
      message: 'Failed to update company',
      error: error.message
    });
  }
};

exports.deleteCompany = async (req, res) => {
  const { companyId } = req.params;

  try {
    if (!companyId) {
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
        success: false,
        message: 'Company ID is required'
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      logger.warn('Company not found for deletion:', { companyId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
        success: false,
        message: 'Company not found'
      });
    }

    await company.remove();

    logger.info('Company deleted successfully:', { companyId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting company with ID ${companyId}:`, error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/companies`, {
      success: false,
      message: 'Failed to delete company',
      error: error.message
    });
  }
};
