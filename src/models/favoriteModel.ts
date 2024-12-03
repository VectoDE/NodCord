import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IFavorite extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  type: 'project' | 'product' | 'task' | 'company';
  itemId: mongoose.Types.ObjectId;
  createdDate: Date;
}

const favoriteSchema: Schema<IFavorite> = new Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
      enum: ['project', 'product', 'task', 'company'],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
  },
);

favoriteSchema.pre<IFavorite>('save', function (next) {
  if (!this.id) {
    this.id = `Favorite-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);
