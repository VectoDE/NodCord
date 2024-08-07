const Log = require('../../models/logModel');
const logger = require('../services/loggerService');

const createLog = async (req, res) => {
  try {
    const logData = req.body;

    const newLog = new Log(logData);
    await newLog.save();

    res.status(201).json(newLog);
  } catch (error) {
    logger.error('Error creating log:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const logItem = await Log.findById(logId);

    if (!logItem) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.status(200).json(logItem);
  } catch (error) {
    logger.error('Error fetching log:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find();
    res.status(200).json(logs);
  } catch (error) {
    logger.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const deletedLog = await Log.findByIdAndDelete(logId);

    if (!deletedLog) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.status(200).json({ message: 'Log deleted successfully' });
  } catch (error) {
    logger.error('Error deleting log:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createLog,
  getLog,
  getAllLogs,
  deleteLog,
};
