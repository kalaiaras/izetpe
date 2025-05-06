import { Schema, model } from "mongoose";
import { IUser, ITransaction } from "../interface/types";

const TransactionSchema = new Schema<ITransaction>({
  amount: { type: Number, required: true },
  type: { type: String, enum: ["SIGNUP_BONUS", "REFERRAL_BONUS", "WITHDRAWAL"], required: true },
  timestamp: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: null },
  walletBalance: { type: Number, default: 100 },
  transactions: [TransactionSchema],
  loginHistory: [{ type: Date }],
  isAdmin: { type: Boolean, default: false }
},
{
  timestamps:true
}
);

export const User = model<IUser>("User", UserSchema);