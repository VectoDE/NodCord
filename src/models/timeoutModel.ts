import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITimeout extends Document {
  id: string;
  userId: string;
  username: string;
  guildId: string;
  reason: string;
  duration: number;
  timeoutAt: Date;
}

const timeoutSchema: Schema<ITimeout> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  timeoutAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

timeoutSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Timeout-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < ITimeout > ('Timeout', timeoutSchema);
