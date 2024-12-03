import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IOrganization extends Document {
  id: string;
  name: string;
  description?: string;
  foundedDate: Date;
  members: mongoose.Types.ObjectId[];
}

const organizationSchema: Schema<IOrganization> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  foundedDate: {
    type: Date,
    default: Date.now,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

organizationSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Organization-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<IOrganization>('Organization', organizationSchema);
