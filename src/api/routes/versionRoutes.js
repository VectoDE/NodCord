const express = require('express');
const router = express.Router();
const versionController = require('../controllers/versionController');

router.get('/', versionController.getAllVersions);

router.get('/:id', versionController.getVersionById);

router.post('/create', versionController.createVersion);

router.put('/:id/update', versionController.updateVersion);

router.delete('/:id/delete', versionController.deleteVersion);

module.exports = router;
