import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IOrder extends Document {
  id: string;
  customer: mongoose.Types.ObjectId;
  products: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
  }>;
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  trackingNumber?: string;
  createdAt: Date;
}

const orderSchema: Schema<IOrder> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  products: [
    {
      product: {
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
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered'],
    default: 'Pending',
  },
  trackingNumber: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Order-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IOrder > ('Order', orderSchema);
