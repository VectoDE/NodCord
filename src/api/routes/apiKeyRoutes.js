const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const authMiddleware = require('../middlewares/authMiddleware');
const developerProgramMiddleware = require('../middlewares/developerProgramMiddleware');

router.post('/create', authMiddleware, developerProgramMiddleware, apiKeyController.createApiKey);

router.delete('/delete/:id', authMiddleware, developerProgramMiddleware, apiKeyController.deleteApiKey);

router.get('/', authMiddleware, developerProgramMiddleware, apiKeyController.getApiKeys);

router.put('/update/:id', authMiddleware, developerProgramMiddleware, apiKeyController.updateApiKey);

module.exports = router;
