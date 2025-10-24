require('dotenv').config();
const Task = require('../../models/taskModel');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../../services/logger.service');

exports.listTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo').populate('team');
    logger.info('Fetched tasks:', { count: tasks.length });
    const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      tasks
    });
  } catch (error) {
    logger.error('Failed to list tasks:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, category, status, assignedTo, team, dueDate } = req.body;
    if (!title || !assignedTo || !team) {
      logger.warn('Missing required fields in create task request:', { body: req.body });
      const redirectUrl = `${getBaseUrl()}/dashboard/tasks/create`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Title, Assigned To, and Team are required'
      });
    }

    const newTask = new Task({ title, description, category, status, assignedTo, team, dueDate });
    await newTask.save();
    logger.info('Created new task:', { id: newTask._id, title });
    const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    logger.error('Failed to create task:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tasks/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

exports.getTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      logger.warn('Task ID is missing in get task details request:', { params: req.params });
      const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Task ID is required'
      });
    }

    const task = await Task.findById(id).populate('assignedTo').populate('team');
    if (!task) {
      logger.warn('Task not found:', { id });
      const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Task not found'
      });
    }

    logger.info('Fetched task details:', { id });
    const redirectUrl = `${getBaseUrl()}/dashboard/tasks/${id}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      task
    });
  } catch (error) {
    logger.error('Failed to get task details:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching task details',
      error: error.message
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id, title, description, category, status, assignedTo, team, dueDate } = req.body;
    if (!id) {
      logger.warn('Task ID is missing in update task request:', { body: req.body });
      const redirectUrl = `${getBaseUrl()}/dashboard/tasks/edit`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Task ID is required'
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      logger.warn('Task not found for update:', { id });
      const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Task not found'
      });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (category) task.category = category;
    if (status) task.status = status;
    if (assignedTo) task.assignedTo = assignedTo;
    if (team) task.team = team;
    if (dueDate) task.dueDate = dueDate;

    await task.save();
    logger.info('Updated task:', { id });
    const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    logger.error('Failed to update task:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tasks/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      logger.warn('Task ID is missing in delete task request:', { body: req.body });
      const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Task ID is required'
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      logger.warn('Task not found for deletion:', { id });
      const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Task not found'
      });
    }

    await task.remove();
    logger.info('Deleted task:', { id });
    const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete task:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tasks`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};
