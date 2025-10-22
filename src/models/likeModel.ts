import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ILike extends Document {
  id: string;
  user: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  createdAt: Date;
}

const likeSchema: Schema<ILike> = new Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

likeSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Like-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < ILike > ('Like', likeSchema);
