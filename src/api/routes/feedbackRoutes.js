const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Route zum Erstellen von Feedback
router.post('/feedback', feedbackController.createFeedback);

// Route zum Abrufen aller Feedbacks
router.get('/feedbacks', feedbackController.getAllFeedbacks);

module.exports = router;
