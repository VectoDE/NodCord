const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/create', userController.createUser);

router.get('/', userController.getAllUsers);

router.get('/:id', userController.getUserById);

router.put('/update/:id', userController.updateUser);

router.delete('/delete/:id', userController.deleteUser);

router.get('/me', userController.getUser);

module.exports = router;
