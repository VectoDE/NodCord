import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISubscriber extends Document {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
}

const subscriberSchema: Schema<ISubscriber> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    trim: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

subscriberSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Subscriber-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < ISubscriber > ('Subscriber', subscriberSchema);
