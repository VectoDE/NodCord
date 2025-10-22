import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMessage extends Document {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  id: string;
  participants: string[];
  messages: IMessage[];
  type: 'member_to_member' | 'member_to_organization' | 'member_to_group';
}

const messageSchema: Schema<IMessage> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema: Schema<IChat> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  participants: [
    {
      type: String,
      required: true,
    },
  ],
  messages: [messageSchema],
  type: {
    type: String,
    enum: ['member_to_member', 'member_to_organization', 'member_to_group'],
    required: true,
  },
});

messageSchema.pre<IMessage>('save', function () {
  if (!this.id) {
    this.id = `Message-${uuidv4()}`;
  }
});

chatSchema.pre<IChat>('save', function () {
  if (!this.id) {
    this.id = `Chat-${uuidv4()}`;
  }
});

export const MessageModel = mongoose.model<IMessage>('Message', messageSchema);
export default mongoose.model<IChat>('Chat', chatSchema);
