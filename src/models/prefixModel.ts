import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IPrefix extends Document {
  id: string;
  guildId: string;
  prefix: string;
}

const prefixSchema: Schema<IPrefix> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  prefix: {
    type: String,
    required: true,
  },
});

prefixSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Prefix-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<IPrefix>('Prefix', prefixSchema);
