const mongoose = require('mongoose');

const triviaQuestionSchema = new mongoose.Schema({
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

const triviaAnswerSchema = new mongoose.Schema({
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

const triviaStatsSchema = new mongoose.Schema({
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

const TriviaQuestion = mongoose.model('TriviaQuestion', triviaQuestionSchema);
const TriviaAnswer = mongoose.model('TriviaAnswer', triviaAnswerSchema);
const TriviaStats = mongoose.model('TriviaStats', triviaStatsSchema);

module.exports = { TriviaQuestion, TriviaAnswer, TriviaStats };
