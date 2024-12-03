import mongoose, { Schema, Document } from 'mongoose';

export interface IAntilink extends Document {
  Guild: string;
  Perms: string;
}

const antilinkSchema: Schema<IAntilink> = new Schema({
  Guild: {
    type: String,
    required: true,
  },
  Perms: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IAntilink>('Antilink', antilinkSchema);
