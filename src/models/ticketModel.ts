import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITicket extends Document {
  id: string;
  guildId: string;
  userId: string;
  title: string;
  description: string;
  status: 'open' | 'closed';
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface IMessage {
  messageId: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

const ticketSchema: Schema<ITicket> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: 'No description provided',
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  messages: [
    {
      messageId: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      authorId: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

ticketSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `Ticket-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<ITicket>('Ticket', ticketSchema);
