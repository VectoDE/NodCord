import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IProject extends Document {
  id: string;
  picture?: string;
  title: string;
  shortDescription: string;
  detailDescription: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  startDate: Date;
  endDate?: Date | null;
  members: mongoose.Types.ObjectId[];
  tags: mongoose.Types.ObjectId[];
  createdDate: Date;
}

const projectSchema: Schema<IProject> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  picture: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  detailDescription: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
    default: 'Not Started',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
  ],
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
    },
  ],
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

projectSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Project-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IProject > ('Project', projectSchema);
