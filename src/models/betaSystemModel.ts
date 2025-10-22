import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBetaSystem extends Document {
  id: string;
  isActive: boolean;
}

const betaSystemSchema: Schema<IBetaSystem> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

betaSystemSchema.pre<IBetaSystem>('save', function () {
  if (!this.id) {
    this.id = `BetaKeySystem-${uuidv4()}`;
  }
});

export default mongoose.model<IBetaSystem>('BetaSystem', betaSystemSchema);
