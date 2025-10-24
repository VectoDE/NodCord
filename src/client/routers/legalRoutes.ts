const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

router.get('/imprint', (req, res) => {
  const currentUser = req.user;
  res.render('legal/imprint', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    errorstack: null,
    currentUser,
  });
});

router.get('/terms-of-service', (req, res) => {
  const currentUser = req.user;
  res.render('legal/termsOfService', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    errorstack: null,
    currentUser,
  });
});

router.get('/privacy-policy', (req, res) => {
  const currentUser = req.user;
  res.render('legal/privacyPolicy', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    errorstack: null,
    currentUser,
  });
});

module.exports = router;
