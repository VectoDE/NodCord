const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

router.get('/', tagController.listTags);

router.get('/:tagId', tagController.getTagDetails);

router.post('/create', tagController.createTag);

router.post('/:tagId/update', tagController.updateTag);

router.post('/:tagId/delete', tagController.deleteTag);

module.exports = router;
