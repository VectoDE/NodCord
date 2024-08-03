const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/verify-email/:token', authController.verifyEmail);

router.get('/logout', authController.logout);

module.exports = router;
