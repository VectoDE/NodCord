import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITicketResponse extends Document {
  id: string;
  ticketId: mongoose.Types.ObjectId;
  userId: string;
  response: string;
  createdAt: Date;
}

const ticketResponseSchema: Schema<ITicketResponse> = new Schema({
  id: {
    type: String,
    unique: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

ticketResponseSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `TicketResponse-${uuidv4()}`;
  }
  next();
});

export default mongoose.model<ITicketResponse>('TicketResponse', ticketResponseSchema);
