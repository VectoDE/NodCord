const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.listTasks);

router.post('/', taskController.createTask);

router.get('/:taskId', taskController.getTaskDetails);

router.put('/update', taskController.updateTask);

router.delete('/delete', taskController.deleteTask);

module.exports = router;
