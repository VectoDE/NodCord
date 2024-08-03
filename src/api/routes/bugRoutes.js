const express = require('express');
const router = express.Router();
const bugController = require('../controllers/bugController');

// Route zum Erstellen eines neuen Bugs
router.post('/', bugController.createBug);

// Route zum Abrufen aller Bugs
router.get('/', bugController.getAllBugs);

// Route zum Abrufen eines Bugs nach ID
router.get('/:id', bugController.getBugById);

// Route zum Aktualisieren eines Bugs nach ID
router.put('/:id', bugController.updateBug);

// Route zum Löschen eines Bugs nach ID
router.delete('/:id', bugController.deleteBug);

module.exports = router;
