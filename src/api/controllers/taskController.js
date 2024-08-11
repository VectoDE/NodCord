const Task = require('../../models/taskModel');
const logger = require('../services/loggerService');

const listTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo').populate('team');
    logger.info('Fetched tasks:', { count: tasks.length });
    res.status(200).json(tasks);
  } catch (error) {
    logger.error('Failed to list tasks:', error);
    res.status(500).json({ error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, category, status, assignedTo, team, dueDate } =
      req.body;
    if (!title || !assignedTo || !team) {
      logger.warn('Missing required fields in create task request:', {
        body: req.body,
      });
      return res
        .status(400)
        .json({ error: 'Title, Assigned To, and Team are required' });
    }

    const newTask = new Task({
      title,
      description,
      category,
      status,
      assignedTo,
      team,
      dueDate,
    });

    await newTask.save();
    logger.info('Created new task:', { taskId: newTask._id, title });
    res.status(201).json(newTask);
  } catch (error) {
    logger.error('Failed to create task:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!taskId) {
      logger.warn('Task ID is missing in get task details request:', {
        params: req.params,
      });
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const task = await Task.findById(taskId)
      .populate('assignedTo')
      .populate('team');
    if (!task) {
      logger.warn('Task not found:', { taskId });
      return res.status(404).json({ error: 'Task not found' });
    }

    logger.info('Fetched task details:', { taskId });
    res.status(200).json(task);
  } catch (error) {
    logger.error('Failed to get task details:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const {
      taskId,
      title,
      description,
      category,
      status,
      assignedTo,
      team,
      dueDate,
    } = req.body;
    if (!taskId) {
      logger.warn('Task ID is missing in update task request:', {
        body: req.body,
      });
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      logger.warn('Task not found for update:', { taskId });
      return res.status(404).json({ error: 'Task not found' });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (category) task.category = category;
    if (status) task.status = status;
    if (assignedTo) task.assignedTo = assignedTo;
    if (team) task.team = team;
    if (dueDate) task.dueDate = dueDate;

    await task.save();
    logger.info('Updated task:', { taskId });
    res.status(200).json(task);
  } catch (error) {
    logger.error('Failed to update task:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) {
      logger.warn('Task ID is missing in delete task request:', {
        body: req.body,
      });
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      logger.warn('Task not found for deletion:', { taskId });
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.remove();
    logger.info('Deleted task:', { taskId });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete task:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listTasks,
  createTask,
  getTaskDetails,
  updateTask,
  deleteTask,
};
