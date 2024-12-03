import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IProduct extends Document {
  id: string;
  picture?: string;
  title: string;
  shortDescription: string;
  detailDescription: string;
  price: number;
  category: string;
  stock: number;
  createdDate: Date;
  updatedDate: Date;
}

const productSchema: Schema<IProduct> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  picture: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  detailDescription: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    default: '',
  },
  stock: {
    type: Number,
    default: 0,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Product-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IProduct > ('Product', productSchema);
