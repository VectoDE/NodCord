const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

router.get('/', tagController.listTags);

router.post('/', tagController.createTag);

router.get('/:tagId', tagController.getTagDetails);

router.put('/update', tagController.updateTag);

router.delete('/delete', tagController.deleteTag);

module.exports = router;
