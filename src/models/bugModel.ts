import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBug extends Document {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  project: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bugSchema: Schema<IBug> = new Schema({
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
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

bugSchema.pre<IBug>('save', function () {
  if (!this.id) {
    this.id = `Bug-${uuidv4()}`;
  }
});

bugSchema.pre<IBug>('save', function () {
  this.updatedAt = new Date();
});

export default mongoose.model<IBug>('Bug', bugSchema)
