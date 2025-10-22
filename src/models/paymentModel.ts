import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IPayment extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  amount: number;
  method: 'credit_card' | 'apple_pay' | 'google_pay' | 'amazon_pay' | 'stripe' | 'paypal' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdDate: Date;
}

const paymentSchema: Schema<IPayment> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    required: true,
    enum: [
      'credit_card',
      'apple_pay',
      'google_pay',
      'amazon_pay',
      'stripe',
      'paypal',
      'bank_transfer',
    ],
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  transactionId: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

paymentSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Payment-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IPayment > ('Payment', paymentSchema);
