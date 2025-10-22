import mongoose, { Schema, Document } from 'mongoose';

export interface IAFK extends Document {
  User: string;
  Guild: string;
  Message: string;
}

const afkSchema: Schema<IAFK> = new Schema({
  User: {
    type: String,
    required: true,
  },
  Guild: {
    type: String,
    required: true,
  },
  Message: {
    type: String,
    required: false,
  },
});

export default mongoose.model<IAFK>('AFK', afkSchema);
