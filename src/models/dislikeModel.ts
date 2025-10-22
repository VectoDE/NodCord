import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IDislike extends Document {
  id: string;
  user: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  createdAt: Date;
}

const dislikeSchema: Schema<IDislike> = new Schema(
  {
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
  },
);

dislikeSchema.pre<IDislike>('save', function (next) {
  if (!this.id) {
    this.id = `Dislike-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<IDislike>('Dislike', dislikeSchema);
