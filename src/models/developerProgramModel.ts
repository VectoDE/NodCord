import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IDeveloperProgram extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const developerProgramSchema: Schema<IDeveloperProgram> = new Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

developerProgramSchema.pre<IDeveloperProgram>('save', function () {
  if (!this.id) {
    this.id = `DeveloperProgram-${uuidv4()}`;
  }
});

export default mongoose.model<IDeveloperProgram>('DeveloperProgram', developerProgramSchema);
