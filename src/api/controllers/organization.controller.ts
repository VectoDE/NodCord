const Organization = require('../../models/organizationModel');
const logger = require('../../services/logger.service');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();
    logger.info('Fetched all organizations successfully');
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations`, {
      success: true,
      data: organizations
    });
  } catch (err) {
    logger.error('Error fetching organizations:', err);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations`, {
      success: false,
      message: 'Failed to fetch organizations',
      error: err.message
    });
  }
};

exports.getOrganizationById = async (req, res) => {
  const { organizationId } = req.params;

  try {
    const organization = await Organization.findById(organizationId).populate('members');

    if (!organization) {
      logger.warn(`Organization with ID ${organizationId} not found`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations/${organizationId}`, {
        success: false,
        message: 'Organization not found'
      });
    }

    logger.info(`Fetched organization with ID ${organizationId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations/${organizationId}`, {
      success: true,
      data: organization
    });
  } catch (err) {
    logger.error('Error fetching organization by ID:', err);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations/${organizationId}`, {
      success: false,
      message: 'Failed to fetch organization details',
      error: err.message
    });
  }
};

exports.createOrganization = async (req, res) => {
  try {
    const organization = new Organization(req.body);
    await organization.save();
    logger.info('Created new organization:', organization._id);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations`, {
      success: true,
      data: organization
    });
  } catch (err) {
    logger.error('Error creating organization:', err);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations/create`, {
      success: false,
      message: 'Failed to create organization',
      error: err.message
    });
  }
};

exports.updateOrganization = async (req, res) => {
  const { organizationId } = req.params;

  try {
    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!organization) {
      logger.warn(`Organization with ID ${organizationId} not found for update`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations/${organizationId}/edit`, {
        success: false,
        message: 'Organization not found'
      });
    }

    logger.info(`Updated organization with ID ${organizationId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations/${organizationId}`, {
      success: true,
      data: organization
    });
  } catch (err) {
    logger.error('Error updating organization:', err);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations/${organizationId}/edit`, {
      success: false,
      message: 'Failed to update organization',
      error: err.message
    });
  }
};

exports.deleteOrganization = async (req, res) => {
  const { organizationId } = req.params;

  try {
    const organization = await Organization.findByIdAndDelete(organizationId);

    if (!organization) {
      logger.warn(`Organization with ID ${organizationId} not found for deletion`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations`, {
        success: false,
        message: 'Organization not found'
      });
    }

    logger.info(`Deleted organization with ID ${organizationId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations`, {
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (err) {
    logger.error('Error deleting organization:', err);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/organizations`, {
      success: false,
      message: 'Failed to delete organization',
      error: err.message
    });
  }
};
