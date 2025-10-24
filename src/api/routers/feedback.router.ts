const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.get('/feedbacks', feedbackController.getAllFeedbacks);

router.post('/create', feedbackController.createFeedback);

module.exports = router;
