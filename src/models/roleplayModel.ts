import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IRoleplay extends Document {
  id: string;
  userId: string;
  characterName: string;
  characterLevel: number;
  experiencePoints: number;
  lastRoleplayDate: Date;
}

const roleplaySchema: Schema<IRoleplay> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  characterName: {
    type: String,
    required: true,
  },
  characterLevel: {
    type: Number,
    default: 1,
  },
  experiencePoints: {
    type: Number,
    default: 0,
  },
  lastRoleplayDate: {
    type: Date,
    default: Date.now,
  },
});

roleplaySchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Roleplay-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IRoleplay > ('Roleplay', roleplaySchema);
