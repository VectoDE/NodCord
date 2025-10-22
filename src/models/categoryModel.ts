import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ICategory extends Document {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema: Schema<ICategory> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

categorySchema.pre<ICategory>('save', function () {
  if (!this.id) {
    this.id = `Category-${uuidv4()}`;
  }
});

export default mongoose.model<ICategory>('Category', categorySchema);
