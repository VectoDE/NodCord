const Project = require('../../models/projectModel');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.listProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('members').populate('tags');
    logger.info('Fetched all projects successfully');
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects`, {
      success: true,
      data: projects
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects`, {
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, members, tags } = req.body;

    if (!name) {
      logger.warn('Attempted to create project without a name');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects/create`, {
        success: false,
        message: 'Name is required'
      });
    }

    const newProject = new Project({
      name,
      description,
      status,
      startDate,
      endDate,
      members,
      tags,
    });

    await newProject.save();
    logger.info('Project created successfully:', newProject);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects`, {
      success: true,
      data: newProject
    });
  } catch (error) {
    logger.error('Error creating project:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects/create`, {
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

exports.getProjectDetails = async (req, res) => {
  const { projectId } = req.params;

  try {
    if (!projectId) {
      logger.warn('Project ID is required to fetch project details');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects/${projectId}`, {
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId)
      .populate('members')
      .populate('tags');

    if (!project) {
      logger.warn(`Project with ID ${projectId} not found`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects/${projectId}`, {
        success: false,
        message: 'Project not found'
      });
    }

    logger.info(`Fetched details for project ID: ${projectId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects/${projectId}`, {
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Error fetching project details:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects/${projectId}`, {
      success: false,
      message: 'Failed to fetch project details',
      error: error.message
    });
  }
};

exports.updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, status, startDate, endDate, members, tags } = req.body;

  try {
    if (!projectId) {
      logger.warn('Project ID is required to update a project');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects/${projectId}/edit`, {
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      logger.warn(`Project with ID ${projectId} not found`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects/${projectId}/edit`, {
        success: false,
        message: 'Project not found'
      });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (members) project.members = members;
    if (tags) project.tags = tags;

    await project.save();
    logger.info(`Project updated successfully: ${projectId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects/${projectId}`, {
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Error updating project:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects/${projectId}/edit`, {
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
};

exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    if (!projectId) {
      logger.warn('Project ID is required to delete a project');
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects`, {
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      logger.warn(`Project with ID ${projectId} not found`);
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects`, {
        success: false,
        message: 'Project not found'
      });
    }

    await project.remove();
    logger.info(`Project deleted successfully: ${projectId}`);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects`, {
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting project:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/projects`, {
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};
