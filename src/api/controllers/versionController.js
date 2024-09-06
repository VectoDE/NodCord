const Version = require('../../models/versionModel');

exports.createVersion = async (req, res) => {
    try {
        const version = new Version(req.body);
        await version.save();
        res.status(201).json({ success: true, message: 'Version created successfully', data: version });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllVersions = async (req, res) => {
    try {
        const versions = await Version.find();
        res.status(200).json({ success: true, data: versions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVersionById = async (req, res) => {
    try {
        const version = await Version.findById(req.params.id);
        if (!version) {
            return res.status(404).json({ message: 'Version not found' });
        }
        res.status(200).json({ success: true, data: version });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateVersion = async (req, res) => {
    try {
        const version = await Version.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!version) {
            return res.status(404).json({ message: 'Version not found' });
        }
        res.status(200).json({ success: true, data: version, message: 'Version updated successfully', });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteVersion = async (req, res) => {
    try {
        const version = await Version.findByIdAndDelete(req.params.id);
        if (!version) {
            return res.status(404).json({ message: 'Version not found' });
        }
        res.status(200).json({ success: true, data: version, message: 'Version deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
