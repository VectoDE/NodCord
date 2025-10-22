import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITeam extends Document {
  id: string;
  name: string;
  description: string;
  createdDate: Date;
  members: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive';
  type: 'project' | 'department' | 'esports' | 'other';
  logo: string;
}

const teamSchema: Schema<ITeam> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  type: {
    type: String,
    enum: ['project', 'department', 'esports', 'other'],
    default: 'other',
  },
  logo: {
    type: String,
    default: 'default-team-logo.png',
  },
}, { timestamps: true });

teamSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Team-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<ITeam>('Team', teamSchema);
