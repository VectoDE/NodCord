import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IFeedback extends Document {
  id: string;
  userId: string;
  guildId: string;
  feedbackText: string;
  createdAt: Date;
}

const feedbackSchema: Schema<IFeedback> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  feedbackText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

feedbackSchema.pre<IFeedback>('save', function (next) {
  if (!this.id) {
    this.id = `Feedback-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);
