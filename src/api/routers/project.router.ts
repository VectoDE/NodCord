const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.listProjects);

router.get('/:projectId', projectController.getProjectDetails);

router.post('/create', projectController.createProject);

router.post('/:projectId/update', projectController.updateProject);

router.post('/:projectId/delete', projectController.deleteProject);

module.exports = router;
