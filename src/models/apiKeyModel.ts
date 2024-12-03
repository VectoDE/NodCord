import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IApiKey extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  key: string;
  createdAt: Date;
  expiresAt: Date;
}

const apiKeySchema: Schema<IApiKey> = new Schema({
  id: {
    type: String,
    default: () => `ApiKey-${uuidv4()}`,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

export default mongoose.model<IApiKey>('ApiKey', apiKeySchema);
