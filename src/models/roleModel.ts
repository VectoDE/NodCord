import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IRole extends Document {
  id: string;
  name: string;
  displayName: string;
  color: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema: Schema<IRole> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#000000',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

roleSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Role-${uuidv4()}`;
  }
  next();
});

export default mongoose.model < IRole > ('Role', roleSchema);
