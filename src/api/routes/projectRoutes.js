const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.listProjects);

router.post('/', projectController.createProject);

router.get('/:projectId', projectController.getProjectDetails);

router.put('/update', projectController.updateProject);

router.delete('/delete', projectController.deleteProject);

module.exports = router;
