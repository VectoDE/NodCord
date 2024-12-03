import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IStory extends Document {
  id: string;
  title: string;
  description: string;
  status: 'Backlog' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  updatedAt: Date;
  project: mongoose.Types.ObjectId;
}

const storySchema: Schema<IStory> = new Schema({
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
    enum: ['Backlog', 'In Progress', 'Completed'],
    default: 'Backlog',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
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
}, { timestamps: true });

storySchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Story-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IStory > ('Story', storySchema);
