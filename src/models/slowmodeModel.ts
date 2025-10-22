import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISlowmode extends Document {
  id: string;
  channelId: string;
  duration: number;
  setBy: string;
  setAt: Date;
}

const slowmodeSchema: Schema<ISlowmode> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  channelId: {
    type: String,
    required: true,
    unique: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  setBy: {
    type: String,
    required: true,
  },
  setAt: {
    type: Date,
    default: Date.now,
  },
});

slowmodeSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Slowmode-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < ISlowmode > ('Slowmode', slowmodeSchema);
