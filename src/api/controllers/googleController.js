const GoogleService = require('../services/googleService');
const googleService = new GoogleService();

exports.listFiles = async (req, res) => {
    try {
        const files = await googleService.listFiles();
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list files' });
    }
};

exports.uploadFile = async (req, res) => {
    try {
        const filePath = req.file.path;
        const fileId = await googleService.uploadFile(filePath);
        res.status(201).json({ fileId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload file' });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        await googleService.deleteFile(fileId);
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const destPath = `./downloads/${fileId}`;
        await googleService.downloadFile(fileId, destPath);
        res.download(destPath);
    } catch (error) {
        res.status(500).json({ error: 'Failed to download file' });
    }
};
