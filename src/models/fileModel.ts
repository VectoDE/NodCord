import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IFile extends Document {
  id: string;
  filename: string;
  path: string;
  url?: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
  name: string;
  createdAt: string;
}

const fileSchema: Schema<IFile> = new Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    size: {
      type: Number,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
);

fileSchema.pre<IFile>('save', function (next) {
  if (!this.id) {
    this.id = `File-${uuidv4()}`;
  }
  const baseURL = process.env.BASE_URL || '';
  const port = process.env.NODE_ENV === 'development' ? `:${process.env.API_PORT}` : '';
  this.url = `${baseURL}:${port}/${this.path}`;
  next();
});

fileSchema.virtual('name').get(function() {
  return this.filename;
});

export default mongoose.model<IFile>('File', fileSchema);
