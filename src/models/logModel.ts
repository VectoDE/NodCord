import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ILog extends Document {
  id: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  timestamp: Date;
  additionalData?: Record<string, any>;
}

const logSchema: Schema<ILog> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  message: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['info', 'warn', 'error'],
    default: 'info',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  additionalData: {
    type: mongoose.Schema.Types.Mixed,
  },
});

logSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Log-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<ILog>('Log', logSchema);
