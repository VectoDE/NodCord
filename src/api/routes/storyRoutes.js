const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

router.get('/', storyController.getAllStories);

router.get('/:storyId', storyController.getStoryById);

router.post('/create', storyController.createStory);

router.put('/:storyId/update', storyController.updateStory);

router.delete('/:storyId/delete', storyController.deleteStory);

module.exports = router;
