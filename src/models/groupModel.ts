import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IGroup extends Document {
  id: string;
  name: string;
  description?: string;
  members: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
}

const groupSchema: Schema<IGroup> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

groupSchema.pre<IGroup>('save', function (next) {
  if (!this.id) {
    this.id = `Group-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<IGroup>('Group', groupSchema);
