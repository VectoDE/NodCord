const express = require('express');
const router = express.Router();
const versionController = require('../controllers/versionController');

router.get('/', versionController.getAllVersions);

router.get('/:versionId', versionController.getVersionById);

router.post('/create', versionController.createVersion);

router.post('/:versionId/update', versionController.updateVersion);

router.post('/:versionId/delete', versionController.deleteVersion);

module.exports = router;
