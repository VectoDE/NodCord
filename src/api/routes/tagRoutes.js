const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Listet alle Tags auf
router.get('/', tagController.listTags);

// Erstellt ein neues Tag
router.post('/', tagController.createTag);

// Zeigt Details eines bestimmten Tags an
router.get('/:tagId', tagController.getTagDetails);

// Aktualisiert ein Tag
router.put('/update', tagController.updateTag);

// Entfernt ein Tag
router.delete('/delete', tagController.deleteTag);

module.exports = router;
