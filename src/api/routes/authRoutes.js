const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');

// Google authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback);

// GitHub authentication
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), authController.githubCallback);

// Route zur Verifizierung der E-Mail
router.get('/verify-email/:token', authController.verifyEmail);

// Route für Logout
router.get('/logout', authController.logout);

module.exports = router;
