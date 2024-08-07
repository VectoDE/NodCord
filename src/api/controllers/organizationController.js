const Organization = require('../../models/organizationModel');

exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.status(200).json({ success: true, data: organizations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).populate(
      'members'
    );
    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' });
    }
    res.status(200).json({ success: true, data: organization });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createOrganization = async (req, res) => {
  try {
    const organization = new Organization(req.body);
    await organization.save();
    res.status(201).json({ success: true, data: organization });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' });
    }
    res.status(200).json({ success: true, data: organization });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Organization deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
