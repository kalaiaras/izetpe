import { Document, Model ,Types } from "mongoose";


export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  referralCode: string;
  referredBy?: string;
  walletBalance: number;
  transactions: ITransaction[];
  loginHistory: Date[];
  isAdmin:  Boolean
  
}

export interface ITransaction {
  amount: number;
  type: "SIGNUP_BONUS" | "REFERRAL_BONUS" | "WITHDRAWAL";
  timestamp?: Date;
}



export interface IUsedReferral extends Document {
  referralCode: string;
  referredUserId: Types.ObjectId;
  referrerUserId: Types.ObjectId;
  timestamp?: Date;
}

// Message Interface
export interface IMessage extends Document {
  sender: string;
  receiver: string;
  content: string;
  timestamp?: Date;
}

// Express Request Extensions
export interface AuthRequest extends Request {
  user?: IUser;
}