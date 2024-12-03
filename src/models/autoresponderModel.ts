import mongoose, { Schema, Document } from 'mongoose';

export interface IAutoresponder extends Document {
  guildId: string;
  autoresponses: Array<{
    trigger: string;
    response: string;
  }>;
}

const autoresponderSchema: Schema<IAutoresponder> = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  autoresponses: [
    {
      trigger: {
        type: String,
        required: true,
      },
      response: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.model<IAutoresponder>('AutoResponder', autoresponderSchema);
