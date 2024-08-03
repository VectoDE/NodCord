const Project = require('../../models/projectModel');

const listProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('members').populate('tags');
        res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const createProject = async (req, res) => {
    try {
        const { name, description, status, startDate, endDate, members, tags } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const newProject = new Project({
            name,
            description,
            status,
            startDate,
            endDate,
            members,
            tags
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        const project = await Project.findById(projectId).populate('members').populate('tags');
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const { projectId, name, description, status, startDate, endDate, members, tags } = req.body;
        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
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
        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await project.remove();
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    listProjects,
    createProject,
    getProjectDetails,
    updateProject,
    deleteProject
};
