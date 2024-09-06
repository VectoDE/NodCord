const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.get('/', groupController.getAllGroups);

router.get('/:id', groupController.getGroupById);

router.post('/create', groupController.createGroup);

router.put('/update/:id', groupController.updateGroup);

router.delete('/delete/:id', groupController.deleteGroup);

module.exports = router;
