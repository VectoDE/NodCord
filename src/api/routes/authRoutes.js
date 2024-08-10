const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('../utils/passportUtil');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

router.get('/auth/apple', passport.authenticate('apple'));
router.post('/auth/apple/callback', passport.authenticate('apple', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

router.get('/auth/microsoft', passport.authenticate('microsoft'));
router.get('/auth/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

router.get('/auth/faceit', passport.authenticate('faceit'));
router.get('/auth/faceit/callback', passport.authenticate('faceit', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

router.get('/verify-email/:token', authController.verifyEmail);

router.get('/logout', authController.logout);

module.exports = router;
