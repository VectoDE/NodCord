const Role = require('../../models/roleModel');
const logger = require('../services/loggerService');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    logger.info('Fetched all roles successfully');
    res.status(200).json({ success: true, roles });
  } catch (err) {
    logger.error(`Error fetching roles: ${err.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      logger.warn('Role creation failed: Name is required');
      return res
        .status(400)
        .json({ success: false, message: 'Name is required' });
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      logger.warn(
        `Role creation failed: Role with name "${name}" already exists`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: 'Role with this name already exists',
        });
    }

    const role = new Role({ name, description });
    await role.save();
    logger.info(`Role created successfully: ${name}`);
    res.status(201).json({ success: true, role });
  } catch (err) {
    logger.error(`Error creating role: ${err.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      logger.warn(`Role not found with ID: ${id}`);
      return res
        .status(404)
        .json({ success: false, message: 'Role not found' });
    }
    logger.info(`Fetched role by ID: ${id}`);
    res.status(200).json({ success: true, role });
  } catch (err) {
    logger.error(`Error fetching role by ID: ${err.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const role = await Role.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!role) {
      logger.warn(`Role not found with ID: ${id}`);
      return res
        .status(404)
        .json({ success: false, message: 'Role not found' });
    }

    logger.info(`Role updated successfully: ${id}`);
    res.status(200).json({ success: true, role });
  } catch (err) {
    logger.error(`Error updating role: ${err.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      logger.warn(`Role not found with ID: ${id}`);
      return res
        .status(404)
        .json({ success: false, message: 'Role not found' });
    }

    logger.info(`Role deleted successfully: ${id}`);
    res
      .status(200)
      .json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting role: ${err.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
