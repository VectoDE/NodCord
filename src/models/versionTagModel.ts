import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IVersionTag extends Document {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const versionTagSchema: Schema<IVersionTag> = new Schema({
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
    required: true,
  },
}, { timestamps: true });

versionTagSchema.pre<IVersionTag>('save', function (next) {
  if (!this.id) {
    this.id = `VersionTag-${uuidv4()}`;
  }
  next();
});

export const VersionTagModel = mongoose.model<IVersionTag>('VersionTag', versionTagSchema);
