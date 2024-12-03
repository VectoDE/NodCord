import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITriviaQuestion extends Document {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

export interface ITriviaAnswer extends Document {
  id: string;
  userId: string;
  questionId: mongoose.Types.ObjectId;
  answer: string;
  correct: boolean;
  answeredAt: Date;
}

export interface ITriviaStats extends Document {
  id: string;
  userId: string;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
}

const triviaQuestionSchema: Schema<ITriviaQuestion> = new Schema({
  id: {
    type: String,
    unique: true,
  },
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
}, { timestamps: true });

const triviaAnswerSchema: Schema<ITriviaAnswer> = new Schema({
  id: {
    type: String,
    unique: true,
  },
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
}, { timestamps: true });

const triviaStatsSchema: Schema<ITriviaStats> = new Schema({
  id: {
    type: String,
    unique: true,
  },
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
}, { timestamps: true });

triviaQuestionSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `TriviaQuestion-${uuidv4()}`;
  }
  next();
});

triviaAnswerSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `TriviaAnswer-${uuidv4()}`;
  }
  next();
});

triviaStatsSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `TriviaStats-${uuidv4()}`;
  }
  next();
});

export const TriviaQuestionModel = mongoose.model<ITriviaQuestion>('TriviaQuestion', triviaQuestionSchema);
export const TriviaAnswerModel = mongoose.model<ITriviaAnswer>('TriviaAnswer', triviaAnswerSchema);
export const TriviaStatsModel = mongoose.model<ITriviaStats>('TriviaStats', triviaStatsSchema);
