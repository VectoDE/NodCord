import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IFeature extends Document {
  id: string;
  title: string;
  description: string;
  project: mongoose.Types.ObjectId;
  status: 'Planned' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  updatedAt: Date;
}

const featureSchema: Schema<IFeature> = new Schema({
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
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed'],
    default: 'Planned',
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
});

featureSchema.pre<IFeature>('save', function (next) {
  if (!this.id) {
    this.id = `Feature-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<IFeature>('Feature', featureSchema);
