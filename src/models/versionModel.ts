import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IVersion extends Document {
  id: string;
  picture?: string;
  title: string;
  shortDescription: string;
  detailDescription: string;
  versionTag: mongoose.Types.ObjectId;
  features: string[];
  added: string[];
  fixed: string[];
  bugs: string[];
  developers: string[];
  githublink?: string;
  downloadLink: string;
  releasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const versionSchema: Schema<IVersion> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  picture: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  detailDescription: {
    type: String,
    required: true,
  },
  versionTag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VersionTag',
    required: true,
  },
  features: {
    type: [String],
    default: [],
  },
  added: {
    type: [String],
    default: [],
  },
  fixed: {
    type: [String],
    default: [],
  },
  bugs: {
    type: [String],
    default: [],
  },
  developers: {
    type: [String],
    required: true,
  },
  githublink: {
    type: String,
    default: '',
  },
  downloadLink: {
    type: String,
    required: true,
  },
  releasedAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

versionSchema.pre<IVersion>('save', function (next) {
  if (!this.id) {
    this.id = `Version-${uuidv4()}`;
  }
  next();
});

export const VersionModel = mongoose.model < IVersion > ('Version', versionSchema);
