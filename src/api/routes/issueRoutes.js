const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');

// Route zum Erstellen eines neuen Issues
router.post('/', issueController.createIssue);

// Route zum Abrufen aller Issues
router.get('/', issueController.getAllIssues);

// Route zum Abrufen eines Issues nach ID
router.get('/:id', issueController.getIssueById);

// Route zum Aktualisieren eines Issues nach ID
router.put('/:id', issueController.updateIssue);

// Route zum Löschen eines Issues nach ID
router.delete('/:id', issueController.deleteIssue);

module.exports = router;
