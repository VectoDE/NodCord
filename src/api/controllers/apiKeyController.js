const ApiKey = require('../../models/apiKeyModel');
const { v4: uuidv4 } = require('uuid');

exports.createApiKey = async (req, res) => {
  try {
    const { name } = req.body;
    const key = uuidv4();

    const apiKey = new ApiKey({
      key,
      name,
      developerProgram: req.apiKey.developerProgram,
    });

    await apiKey.save();

    res.status(201).json({ message: 'API key created', apiKey });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findByIdAndDelete(id);

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    res.status(200).json({ message: 'API key deleted' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({ developerProgram: req.apiKey.developerProgram });

    res.status(200).json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
