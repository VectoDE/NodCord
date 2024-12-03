import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IShare extends Document {
  id: string;
  user: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  platform: 'Facebook' | 'Twitter' | 'LinkedIn' | 'Other';
  createdAt: Date;
}

const shareSchema: Schema<IShare> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['Facebook', 'Twitter', 'LinkedIn', 'Other'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

shareSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Share-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IShare > ('Share', shareSchema);
