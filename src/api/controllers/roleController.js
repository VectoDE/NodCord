const Role = require('../../models/roleModel');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, roles });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    const role = new Role({ name, description });
    await role.save();
    res.status(201).json({ success: true, role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
