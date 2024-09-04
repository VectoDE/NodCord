const express = require('express');
const router = express.Router();

router.get('/imprint', (req, res) => {
  res.render('legal/imprint', {
    isAuthenticated: res.locals.isAuthenticated
  });
});

router.get('/terms-of-service', (req, res) => {
  res.render('legal/termsOfService', {
    isAuthenticated: res.locals.isAuthenticated
  });
});

router.get('/privacy-policy', (req, res) => {
  res.render('legal/privacyPolicy', {
    isAuthenticated: res.locals.isAuthenticated
  });
});

module.exports = router;
