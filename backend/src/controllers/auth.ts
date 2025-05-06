import { Request, Response } from "express";
import { User } from "../models/User";
import  UsedReferral  from "../models/UsedReferral";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { IUser, IUsedReferral } from "../interface/types";
import dotenv from 'dotenv';
import mongoose from "mongoose"
import Wallet from '../models/Wallet';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

// Generate random referral code
const generateReferralCode = (): string => 
  Math.random().toString(36).substring(2, 10).toUpperCase();

export const register = async (req: any, res: any): Promise<void> => {
  const { name, email, password, referralCode } = req.body;
  
  // Start a database session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Email already exists" });
    }

    // Handle referral code if provided
    let referrer: any | null = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode }).session(session);
      if (!referrer) {
        await session.abortTransaction();
        return res.status(400).json({ error: "Invalid referral code" });
      }

      // Check if code was already used
      const isUsed = await UsedReferral.findOne({ 
        referralCode, 
        referredUserId: referrer._id 
      }).session(session);
      
      if (isUsed) {
        await session.abortTransaction();
        return res.status(400).json({ error: "Referral code already used" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      referralCode: generateReferralCode(),
      referredBy: referralCode ? referrer!._id : null,
    });

    // Create wallet for new user
    const newWallet = new Wallet({
      userId: newUser._id,
      balance: 100, // Initial balance or signup bonus
      currency: 'USD', // Default currency
      transactions: [{
        amount: 100,
        type: 'SIGNUP_BONUS',
        description: 'Welcome bonus for new account'
      }]
    });

    // Add referral bonus if applicable
    if (referrer) {
      const REFERRAL_BONUS = 50;
      
      // Update referrer's wallet
      await Wallet.findOneAndUpdate(
        { userId: referrer._id },
        { 
          $inc: { balance: REFERRAL_BONUS },
          $push: {
            transactions: {
              amount: REFERRAL_BONUS,
              type: 'REFERRAL_BONUS',
              description: `Referral bonus for ${email}`
            }
          }
        },
        { session, new: true }
      );

      // Record referral usage
      await UsedReferral.create([{
        referralCode,
        referredUserId: newUser._id,
        referrerUserId: referrer._id,
      }], { session });
    }

    // Save both user and wallet in transaction
    await newUser.save({ session });
    await newWallet.save({ session });
    await session.commitTransaction();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ 
      token, 
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin:newUser.isAdmin,
        referralCode: newUser.referralCode,
        walletBalance: newWallet.balance,
        currency: newWallet.currency
      }, 
     
    });

  } catch (err: any) {
    await session.abortTransaction();
    console.error('Registration error:', err);
    res.status(500).json({ error: "Server error" });
  } finally {
    session.endSession();
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    // Update login history
    user.loginHistory.push(new Date());
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
const wal = await Wallet.findOne({userId : user._id})


    res.json({ token, user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin:user.isAdmin,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance,
      currency:wal?.currency
    },});
  } catch (err: any) {
    res.status(500).json({ error: "Server error" });
  }
};