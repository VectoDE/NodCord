import mongoose, { Schema, Document } from 'mongoose';

export interface IKick extends Document {
  userId: string;
  username: string;
  guildId: string;
  reason: string;
  kickedAt: Date;
}

const kickSchema: Schema<IKick> = new Schema({
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
  kickedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model < IKick > ('Kick', kickSchema);
