import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IWarn extends Document {
  id: string;
  guildId: string;
  userId: string;
  moderatorId: string;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const warnSchema: Schema<IWarn> = new Schema({
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
  moderatorId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
}, { timestamps: true });

warnSchema.pre<IWarn>('save', function (next) {
  if (!this.id) {
    this.id = `Warn-${uuidv4()}`;
  }
  next();
});

export const WarnModel = mongoose.model<IWarn>('Warn', warnSchema);
