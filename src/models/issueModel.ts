import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IIssue extends Document {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
  project: mongoose.Schema.Types.ObjectId;
}

const issueSchema: Schema<IIssue> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
});

issueSchema.pre<IIssue>('save', function (next) {
  if (!this.id) {
    this.id = `Issue-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<IIssue>('Issue', issueSchema);
