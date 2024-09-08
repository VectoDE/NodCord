const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const authMiddleware = require('../middlewares/authMiddleware');
const developerProgramMiddleware = require('../middlewares/developerProgramMiddleware');

router.get('/', authMiddleware, developerProgramMiddleware, apiKeyController.getApiKeys);

router.post('/create', authMiddleware, developerProgramMiddleware, apiKeyController.createApiKey);

router.put('/:keyId/update', authMiddleware, developerProgramMiddleware, apiKeyController.updateApiKey);

router.delete('/:keyId/delete', authMiddleware, developerProgramMiddleware, apiKeyController.deleteApiKey);

module.exports = router;
