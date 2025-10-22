import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface INewsletter extends Document {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
}

const newsletterSchema: Schema<INewsletter> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

newsletterSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Newsletter-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<INewsletter>('Newsletter', newsletterSchema);
