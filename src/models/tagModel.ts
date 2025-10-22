import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITag extends Document {
  id: string;
  name: string;
  description: string;
  createdDate: Date;
}

const tagSchema: Schema<ITag> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

tagSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Tag-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < ITag > ('Tag', tagSchema);
