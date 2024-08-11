const Project = require('../../models/projectModel');
const logger = require('../services/loggerService');

const listProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('members').populate('tags');
    logger.info('Fetched all projects successfully');
    res.status(200).json(projects);
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, members, tags } =
      req.body;

    if (!name) {
      logger.warn('Attempted to create project without a name');
      return res.status(400).json({ error: 'Name is required' });
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
    res.status(201).json(newProject);
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      logger.warn('Project ID is required to fetch project details');
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const project = await Project.findById(projectId)
      .populate('members')
      .populate('tags');

    if (!project) {
      logger.warn(`Project with ID ${projectId} not found`);
      return res.status(404).json({ error: 'Project not found' });
    }

    logger.info(`Fetched details for project ID: ${projectId}`);
    res.status(200).json(project);
  } catch (error) {
    logger.error('Error fetching project details:', error);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
};

const updateProject = async (req, res) => {
  try {
    const {
      projectId,
      name,
      description,
      status,
      startDate,
      endDate,
      members,
      tags,
    } = req.body;

    if (!projectId) {
      logger.warn('Project ID is required to update a project');
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      logger.warn(`Project with ID ${projectId} not found`);
      return res.status(404).json({ error: 'Project not found' });
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
    res.status(200).json(project);
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      logger.warn('Project ID is required to delete a project');
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      logger.warn(`Project with ID ${projectId} not found`);
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.remove();
    logger.info(`Project deleted successfully: ${projectId}`);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

module.exports = {
  listProjects,
  createProject,
  getProjectDetails,
  updateProject,
  deleteProject,
};
