const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

router.get(
  '/',
  authMiddleware,
  checkRole(['admin']),
  roleController.getAllRoles
);

router.post(
  '/',
  authMiddleware,
  checkRole(['admin']),
  roleController.createRole
);

module.exports = router;
