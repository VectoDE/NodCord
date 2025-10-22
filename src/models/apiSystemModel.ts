import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IApiSystem extends Document {
  id: string;
  isActive: boolean;
}

const apiSystemSchema: Schema<IApiSystem> = new Schema({
  id: {
    type: String,
    default: () => `ApiSystem-${uuidv4()}`,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model<IApiSystem>('ApiSystem', apiSystemSchema);
