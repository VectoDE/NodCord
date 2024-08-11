const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const authMiddleware = require('../middlewares/authMiddleware');
const developerProgramMiddleware = require('../middlewares/developerProgramMiddleware');

router.post(
  '/',
  authMiddleware,
  developerProgramMiddleware,
  apiKeyController.createApiKey
);

router.delete(
  '/:id',
  authMiddleware,
  developerProgramMiddleware,
  apiKeyController.deleteApiKey
);

router.get(
  '/',
  authMiddleware,
  developerProgramMiddleware,
  apiKeyController.getApiKeys
);

module.exports = router;
