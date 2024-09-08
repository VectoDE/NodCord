const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');

router.get('/', issueController.getAllIssues);

router.get('/:issueId', issueController.getIssueById);

router.post('/create', issueController.createIssue);

router.post('/:issueId/update', issueController.updateIssue);

router.post('/:issueId/delete', issueController.deleteIssue);

module.exports = router;
