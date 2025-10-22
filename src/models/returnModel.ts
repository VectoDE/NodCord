import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IReturn extends Document {
  id: string;
  orderId: mongoose.Types.ObjectId;
  returnNumber: string;
  returnDate: Date;
  reason: string;
  status: 'Requested' | 'Approved' | 'Rejected' | 'Completed';
  items: { productId: mongoose.Types.ObjectId; quantity: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const returnSchema: Schema<IReturn> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerOrder',
    required: true,
  },
  returnNumber: {
    type: String,
    required: true,
    unique: true,
  },
  returnDate: {
    type: Date,
    default: Date.now,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Requested', 'Approved', 'Rejected', 'Completed'],
    default: 'Requested',
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

returnSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Return-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<IReturn>('Return', returnSchema);
