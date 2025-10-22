import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBetaKey extends Document {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const betaKeySchema: Schema<IBetaKey> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

betaKeySchema.pre<IBetaKey>('save', function () {
  if (!this.id) {
    this.id = `BetaKey-${uuidv4()}`;
  }
});

export default mongoose.model<IBetaKey>('BetaKey', betaKeySchema);
