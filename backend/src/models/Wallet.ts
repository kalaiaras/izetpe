import { Schema, model, Document } from 'mongoose';
import { ITransaction } from '../interface/types';

export interface IWallet extends Document {
  userId: Schema.Types.ObjectId;
  balance: number;
  currency: string;
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true 
    },
    balance: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    currency: { 
      type: String, 
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR'] // Add other currencies as needed
    },
    transactions: [{
      amount: { type: Number, required: true },
      type: { 
        type: String, 
        required: true,
        enum: [
          'DEPOSIT', 
          'WITHDRAWAL', 
          'TRANSFER', 
          'PAYMENT', 
          'REFERRAL_BONUS',
          'SIGNUP_BONUS',
          'REFUND'
        ]
      },
      reference: { type: String }, // Payment reference or transaction ID
      status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'COMPLETED'
      },
      description: { type: String },
      metadata: { type: Schema.Types.Mixed }, // Additional data
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster queries
WalletSchema.index({ userId: 1 });
WalletSchema.index({ 'transactions.timestamp': -1 });

// Virtual for formatted balance
WalletSchema.virtual('formattedBalance').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.balance);
});

// Pre-save hook to round balance
WalletSchema.pre('save', function(next) {
  this.balance = parseFloat(this.balance.toFixed(2));
  next();
});

export default model<IWallet>('Wallet', WalletSchema);