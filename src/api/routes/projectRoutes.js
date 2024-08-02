const express = require('express');
const router = express.Router();
const projectController = require('../../controllers/projectController');

// Listet alle Projekte auf
router.get('/', projectController.listProjects);

// Erstellt ein neues Projekt
router.post('/', projectController.createProject);

// Zeigt Details eines bestimmten Projekts an
router.get('/:projectId', projectController.getProjectDetails);

// Aktualisiert ein Projekt
router.put('/update', projectController.updateProject);

// Entfernt ein Projekt
router.delete('/delete', projectController.deleteProject);

module.exports = router;