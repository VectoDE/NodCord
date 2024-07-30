const path = require('path');
const fs = require('fs');
const File = require('../../models/fileModel');

// Handle file upload
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create a new file record in the database
        const fileData = new File({
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        await fileData.save();

        res.status(200).json({
            message: 'File uploaded successfully',
            file: fileData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle file retrieval
const getFile = async (req, res) => {
    try {
        const fileId = req.params.id;

        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle file download
const downloadFile = async (req, res) => {
    try {
        const fileId = req.params.id;

        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.download(file.path, file.filename);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    uploadFile,
    getFile,
    downloadFile
};
