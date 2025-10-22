import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBalance extends Document {
  id: string;
  userId: string;
  balance: number;
  lastUpdated: Date;
}

const balanceSchema: Schema<IBalance> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 100,
  },
  lastUpdated: {
    type: Date,
    default: () => new Date(),
  },
});

balanceSchema.pre<IBalance>('save', function () {
  if (!this.id) {
    this.id = `Balance-${uuidv4()}`;
  }
  this.lastUpdated = new Date();
});

export default mongoose.model<IBalance>('Balance', balanceSchema);
