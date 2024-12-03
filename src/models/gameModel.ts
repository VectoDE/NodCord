import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IGame extends Document {
  id: string;
  picture?: string;
  title: string;
  shortDescription: string;
  detailDescription?: string;
  genre?: string;
  releaseDate?: Date;
  createdAt: Date;
  developer?: string;
  platforms: mongoose.Schema.Types.ObjectId[];
  ratings: {
    user: mongoose.Schema.Types.ObjectId;
    rating: number;
  }[];
}

const gameSchema: Schema<IGame> = new Schema({
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
  },
  genre: {
    type: String,
  },
  releaseDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  developer: {
    type: String,
  },
  platforms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Platform',
    },
  ],
  ratings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
  ],
});

gameSchema.pre < IGame > ('save', function (next) {
  if (!this.id) {
    this.id = `Game-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IGame > ('Game', gameSchema);
