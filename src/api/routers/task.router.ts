const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.listTasks);

router.get('/:taskId', taskController.getTaskDetails);

router.post('/create', taskController.createTask);

router.post('/:taskId/update', taskController.updateTask);

router.post('/:taskId/delete', taskController.deleteTask);

module.exports = router;
