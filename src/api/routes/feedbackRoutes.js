const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/feedback', feedbackController.createFeedback);

router.get('/feedbacks', feedbackController.getAllFeedbacks);

module.exports = router;
