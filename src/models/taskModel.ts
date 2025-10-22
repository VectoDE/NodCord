import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITask extends Document {
  id: string;
  title: string;
  description: string;
  category: 'development' | 'marketing' | 'design' | 'management' | 'other';
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  assignedTo: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  dueDate?: Date;
  createdDate: Date;
}

const taskSchema: Schema<ITask> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['development', 'marketing', 'design', 'management', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'on-hold'],
    default: 'pending',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  dueDate: {
    type: Date,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

taskSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Task-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < ITask > ('Task', taskSchema);
