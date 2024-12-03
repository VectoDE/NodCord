import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMute extends Document {
  id: string;
  guildId: string;
  userId: string;
  reason: string;
  mutedAt: Date;
  duration: number;
  unmutedAt: Date | null;
}

const muteSchema: Schema<IMute> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: 'No reason provided',
  },
  mutedAt: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
    required: true,
  },
  unmutedAt: {
    type: Date,
    default: null,
  },
});

muteSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Mute-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<IMute>('Mute', muteSchema);
