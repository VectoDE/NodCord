const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.get('/', groupController.getAllGroups);

router.get('/:groupId', groupController.getGroupById);

router.post('/create', groupController.createGroup);

router.post('/:groupId/update', groupController.updateGroup);

router.post('/:groupId/delete', groupController.deleteGroup);

module.exports = router;
