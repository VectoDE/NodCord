import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ICompany extends Document {
  id: string;
  name: string;
  description: string;
  industry: string;
  headquarters: string;
  foundedDate: string;
  employees: number;
  website: string;
  createdDate: Date;
  updatedDate: Date;
}

const companySchema: Schema<ICompany> = new Schema({
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
    default: '',
  },
  industry: {
    type: String,
    default: '',
  },
  headquarters: {
    type: String,
    default: '',
  },
  foundedDate: {
    type: String,
    default: '',
  },
  employees: {
    type: Number,
    default: 0,
  },
  website: {
    type: String,
    default: '',
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

companySchema.pre<ICompany>('save', function () {
  if (!this.id) {
    this.id = `Company-${uuidv4()}`;
  }
});

export default mongoose.model<ICompany>('Company', companySchema);
