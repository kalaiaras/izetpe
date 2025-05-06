import { Request, Response } from "express";
import { User } from "../models/User";
import { IUser, ITransaction } from "../interface/types";

export const getWalletBalance = async (req: any, res: any) => {
  try {
    const userId = req.user?._id; // From JWT middleware
    const user = await User.findById(userId).select("walletBalance");
    if (!user) return res.status(404).json({ error: "User not found" });

     res.json({ balance: user.walletBalance });
  } catch (err: any) {
     res.status(500).json({ error: "Server error" });
  }
};

export const getTransactions = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).select("transactions");
    if (!user) return res.status(404).json({ error: "User not found" });

     res.json({ transactions: user.transactions });
  } catch (err: any) {
     res.status(500).json({ error: "Server error" });
  }
};

export const withdrawFunds = async (req: any, res: any) => {
  const { amount } = req.body;
  const userId = req.user?._id;

  try {
    const user :any = await User.findById(userId);
    if (!user)  res.status(404).json({ error: "User not found" });

    if (user.walletBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    user.walletBalance -= amount;
    user.transactions.push({
      amount,
      type: "WITHDRAWAL",
    });
    await user.save();

    return res.json({ 
      newBalance: user.walletBalance,
      transaction: user.transactions.slice(-1)[0] 
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Server error" });
  }
};