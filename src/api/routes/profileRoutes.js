const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

app.use(authMiddleware(true));

router.get('/profile', (req, res) => {
  res.json({
    username: req.user.username,
    role: req.userRole.displayName,
  });
});

module.exports = router;
