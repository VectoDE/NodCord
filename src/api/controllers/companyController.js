const Company = require('../../models/companyModel');
const logger = require('../services/loggerService');

const listCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    logger.error('Error listing companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

const createCompany = async (req, res) => {
  try {
    const {
      name,
      description,
      industry,
      headquarters,
      foundedDate,
      employees,
      website,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newCompany = new Company({
      name,
      description,
      industry,
      headquarters,
      foundedDate,
      employees,
      website,
    });

    await newCompany.save();
    res
      .status(201)
      .json({ message: 'Company created successfully', company: newCompany });
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
};

const getCompanyDetails = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.status(200).json(company);
  } catch (error) {
    logger.error('Error fetching company details:', error);
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
};

const updateCompany = async (req, res) => {
  try {
    const {
      companyId,
      name,
      description,
      industry,
      headquarters,
      foundedDate,
      employees,
      website,
    } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    if (name) company.name = name;
    if (description) company.description = description;
    if (industry) company.industry = industry;
    if (headquarters) company.headquarters = headquarters;
    if (foundedDate) company.foundedDate = foundedDate;
    if (employees) company.employees = employees;
    if (website) company.website = website;

    company.updatedDate = Date.now();

    await company.save();
    res.status(200).json({ message: 'Company updated successfully', company });
  } catch (error) {
    logger.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    await company.remove();
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    logger.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
};

module.exports = {
  listCompanies,
  createCompany,
  getCompanyDetails,
  updateCompany,
  deleteCompany,
};
