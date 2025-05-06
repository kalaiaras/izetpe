import { Schema, model, Document } from 'mongoose';
import { IUser } from '../interface/types';

// Interface for Message document
export interface IMessage extends Document {
  sender: IUser['_id'];       // Reference to User who sent the message
  receiver: IUser['_id'];     // Reference to User who received the message
  content: string;            // Message content
  timestamp?: Date;           // Auto-generated timestamp
  status?: 'sent' | 'delivered' | 'read'; // Message status
}

// Message Schema
const MessageSchema = new Schema<IMessage>({
  sender: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  receiver: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    trim: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for faster querying
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ timestamp: -1 });

// Create and export the model
export const Message = model<IMessage>('Message', MessageSchema);