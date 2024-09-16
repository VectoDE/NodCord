const mongoose = require('mongoose');

const triviaQuestionModel = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

const triviaAnswerModel = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TriviaQuestion',
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  correct: {
    type: Boolean,
    required: true,
  },
  answeredAt: {
    type: Date,
    default: Date.now,
  },
});

const triviaStatsModel = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  incorrectAnswers: {
    type: Number,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
});

const TriviaQuestionModel = mongoose.model('TriviaQuestion', triviaQuestionModel);
const TriviaAnswerModel = mongoose.model('TriviaAnswer', triviaAnswerModel);
const TriviaStatsModel = mongoose.model('TriviaStats', triviaStatsModel);

module.exports = { TriviaQuestionModel, TriviaAnswerModel, TriviaStatsModel };
