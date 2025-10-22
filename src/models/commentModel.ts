import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IComment extends Document {
  id: string;
  content: string;
  author: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  createdAt: Date;
}

const commentSchema: Schema<IComment> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.pre<IComment>('save', function () {
  if (!this.id) {
    this.id = `Comment-${uuidv4()}`;
  }
});

export default mongoose.model<IComment>('Comment', commentSchema);
