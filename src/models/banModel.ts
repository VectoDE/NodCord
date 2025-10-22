import mongoose, { Schema, Document } from 'mongoose';

export interface IBan extends Document {
  userId: string;
  username: string;
  guildId: string;
  reason: string;
  bannedAt: Date;
}

const banSchema: Schema<IBan> = new Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  bannedAt: {
    type: Date,
    default: () => new Date(),
  },
});

export default mongoose.model<IBan>('Ban', banSchema);
