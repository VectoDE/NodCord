const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

// Route zum Erstellen einer neuen Story
router.post('/', storyController.createStory);

// Route zum Abrufen aller Stories
router.get('/', storyController.getAllStories);

// Route zum Abrufen einer Story nach ID
router.get('/:id', storyController.getStoryById);

// Route zum Aktualisieren einer Story nach ID
router.put('/:id', storyController.updateStory);

// Route zum Löschen einer Story nach ID
router.delete('/:id', storyController.deleteStory);

module.exports = router;
