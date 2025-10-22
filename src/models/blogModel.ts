import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBlog extends Document {
  id: string;
  picture?: string;
  title: string;
  shortDescription: string;
  detailDescription: string;
  project?: mongoose.Types.ObjectId;
  author: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema: Schema<IBlog> = new Schema({
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
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: false,
  },
  author: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
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

blogSchema.pre<IBlog>('save', function () {
  if (!this.id) {
    this.id = `Blog-${uuidv4()}`;
  }
});

blogSchema.pre<IBlog>('save', function () {
  this.updatedAt = new Date();
});

export default mongoose.model<IBlog>('Blog', blogSchema);
