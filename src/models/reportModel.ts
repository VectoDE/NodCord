import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IReport extends Document {
  id: string;
  userId: string;
  guildId: string;
  reportedUserId: string;
  reason: string;
  createdAt: Date;
}

const reportSchema: Schema<IReport> = new Schema({
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
  reportedUserId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reportSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Report-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IReport > ('Report', reportSchema);
