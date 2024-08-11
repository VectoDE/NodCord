const Organization = require('../../models/organizationModel');
const logger = require('../services/loggerService');

exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();
    logger.info('Fetched all organizations successfully');
    res.status(200).json({ success: true, data: organizations });
  } catch (err) {
    logger.error('Error fetching organizations:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).populate(
      'members'
    );
    if (!organization) {
      logger.warn(`Organization with ID ${req.params.id} not found`);
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' });
    }
    logger.info(`Fetched organization with ID ${req.params.id}`);
    res.status(200).json({ success: true, data: organization });
  } catch (err) {
    logger.error('Error fetching organization by ID:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.createOrganization = async (req, res) => {
  try {
    const organization = new Organization(req.body);
    await organization.save();
    logger.info('Created new organization:', organization._id);
    res.status(201).json({ success: true, data: organization });
  } catch (err) {
    logger.error('Error creating organization:', err);
    res.status(400).json({ success: false, message: 'Bad Request' });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!organization) {
      logger.warn(`Organization with ID ${req.params.id} not found for update`);
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' });
    }
    logger.info(`Updated organization with ID ${req.params.id}`);
    res.status(200).json({ success: true, data: organization });
  } catch (err) {
    logger.error('Error updating organization:', err);
    res.status(400).json({ success: false, message: 'Bad Request' });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    if (!organization) {
      logger.warn(
        `Organization with ID ${req.params.id} not found for deletion`
      );
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' });
    }
    logger.info(`Deleted organization with ID ${req.params.id}`);
    res
      .status(200)
      .json({ success: true, message: 'Organization deleted successfully' });
  } catch (err) {
    logger.error('Error deleting organization:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
