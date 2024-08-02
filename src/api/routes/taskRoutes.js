const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/taskController');

// Listet alle Aufgaben auf
router.get('/', taskController.listTasks);

// Erstellt eine neue Aufgabe
router.post('/', taskController.createTask);

// Zeigt Details einer bestimmten Aufgabe an
router.get('/:taskId', taskController.getTaskDetails);

// Aktualisiert eine Aufgabe
router.put('/update', taskController.updateTask);

// Entfernt eine Aufgabe
router.delete('/delete', taskController.deleteTask);

module.exports = router;