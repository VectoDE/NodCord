const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');

router.post('/', issueController.createIssue);

router.get('/', issueController.getAllIssues);

router.get('/:id', issueController.getIssueById);

router.put('/:id', issueController.updateIssue);

router.delete('/:id', issueController.deleteIssue);

module.exports = router;
