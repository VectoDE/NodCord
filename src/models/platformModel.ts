import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IPlatform extends Document {
  id: string;
  picture?: string;
  title: string;
  description?: string;
  releaseDate?: Date;
  createdAt: Date;
}

const platformSchema: Schema<IPlatform> = new Schema({
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
  },
  description: {
    type: String,
  },
  releaseDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

platformSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Platform-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IPlatform > ('Platform', platformSchema);
