import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IWord extends Document {
  id: string;
  guildId: string;
  word: string;
  createdAt: Date;
  updatedAt: Date;
}

const wordSchema: Schema<IWord> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  word: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true });

wordSchema.pre<IWord>('save', function (next) {
  if (!this.id) {
    this.id = `Word-${uuidv4()}`;
  }
  next();
});

export const WordModel = mongoose.model<IWord>('Word', wordSchema);
