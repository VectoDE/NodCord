const express = require('express');
const router = express.Router();
const developerProgramController = require('../controllers/developerProgramController');
const authMiddleware = require('../middlewares/authMiddleware');
const DeveloperProgramMiddleware = require('../middlewares/developerProgramMiddleware');

router.post(
  '/join',
  authMiddleware,
  developerProgramController.joinDeveloperProgram
);

router.post(
  '/leave',
  authMiddleware,
  DeveloperProgramMiddleware,
  developerProgramController.leaveDeveloperProgram
);

module.exports = router;
