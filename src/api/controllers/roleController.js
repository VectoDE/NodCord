const Role = require('../../models/roleModel');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    logger.info('Fetched all roles successfully');
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles`, {
      success: true,
      data: roles
    });
  } catch (error) {
    logger.error('Error fetching roles:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      logger.warn('Role creation failed: Name is required');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles/create`, {
        success: false,
        message: 'Name is required'
      });
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      logger.warn(`Role creation failed: Role with name "${name}" already exists`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles/create`, {
        success: false,
        message: 'Role with this name already exists'
      });
    }

    const role = new Role({ name, description });
    await role.save();
    logger.info(`Role created successfully: ${name}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles`, {
      success: true,
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    logger.error('Error creating role:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles/create`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getRoleById = async (req, res) => {
  const { roleId } = req.params;

  try {
    const role = await Role.findById(roleId);
    if (!role) {
      logger.warn(`Role not found with ID: ${roleId}`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles/${roleId}`, {
        success: false,
        message: 'Role not found'
      });
    }
    logger.info(`Fetched role by ID: ${roleId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles/${roleId}`, {
      success: true,
      data: role
    });
  } catch (error) {
    logger.error('Error fetching role by ID:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles/${roleId}`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.updateRole = async (req, res) => {
  const { roleId } = req.params;
  const { name, description } = req.body;

  try {
    const role = await Role.findByIdAndUpdate(
      roleId,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!role) {
      logger.warn(`Role not found with ID: ${roleId}`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles/${roleId}/edit`, {
        success: false,
        message: 'Role not found'
      });
    }

    logger.info(`Role updated successfully: ${roleId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles/${roleId}`, {
      success: true,
      data: role
    });
  } catch (error) {
    logger.error('Error updating role:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles/${roleId}/edit`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.deleteRole = async (req, res) => {
  const { roleId } = req.params;

  try {
    const role = await Role.findByIdAndDelete(roleId);
    if (!role) {
      logger.warn(`Role not found with ID: ${roleId}`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles`, {
        success: false,
        message: 'Role not found'
      });
    }

    logger.info(`Role deleted successfully: ${roleId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles`, {
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting role:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/roles`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
