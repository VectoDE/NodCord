const express = require('express');
const router = express.Router();
const betaKeyController = require('../controllers/betaController');

// Route zum Erstellen eines neuen Beta Keys
router.post('/create', betaKeyController.createBetaKey);

// Route zum Bearbeiten eines Beta Keys
router.put('/edit/:id', betaKeyController.editBetaKey);

// Route zum Löschen eines Beta Keys
router.delete('/delete/:id', betaKeyController.deleteBetaKey);

// Route zum Aktivieren/Deaktivieren des Beta Systems
router.post('/toggle', betaKeyController.toggleBetaSystem);

// Route zum Abrufen aller Beta Keys
router.get('/keys', betaKeyController.getBetaKeys);

// Route zur Verifizierung eines Beta Keys
router.post('/verify', betaKeyController.verifyBetaKey);

module.exports = router;
