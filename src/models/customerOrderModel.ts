import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICustomerOrder extends Document {
  id: string;
  customerId: mongoose.Types.ObjectId;
  orderNumber: string;
  orderDate: Date;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: IItem[];
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerOrderSchema: Schema<ICustomerOrder> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
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
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  billingAddress: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

customerOrderSchema.pre<ICustomerOrder>('save', function () {
  if (!this.id) {
    this.id = `CustomerOrder-${uuidv4()}`;
  }
});

export default mongoose.model<ICustomerOrder>('CustomerOrder', customerOrderSchema);
