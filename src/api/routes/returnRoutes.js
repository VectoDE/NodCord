const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

// Route zum Erstellen einer neuen Rücksendung
router.post('/', returnController.createReturn);

// Route zum Abrufen aller Rücksendungen
router.get('/', returnController.getAllReturns);

// Route zum Abrufen einer Rücksendung nach ID
router.get('/:id', returnController.getReturnById);

// Route zum Aktualisieren einer Rücksendung nach ID
router.put('/:id', returnController.updateReturn);

// Route zum Löschen einer Rücksendung nach ID
router.delete('/:id', returnController.deleteReturn);

module.exports = router;
