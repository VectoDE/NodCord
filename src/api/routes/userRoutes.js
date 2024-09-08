const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);

router.get('/:userId', userController.getUserById);

router.post('/create', userController.createUser);

router.post('/:userId/update', userController.updateUser);

router.post('/:userId/delete', userController.deleteUser);

module.exports = router;
