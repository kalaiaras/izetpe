import { Request, Response } from "express";
import { User } from "../models/User";
import  UsedReferral  from "../models/UsedReferral";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
     res.json({ users });
  } catch (err: any) {
     res.status(500).json({ error: "Server error" });
  }
};

export const getLoginStats = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("loginHistory name email");
    const stats = users.map(user => ({
      name: user.name,
      email: user.email,
      logins: user.loginHistory.length,
      lastLogin: user.loginHistory.slice(-1)[0] || null
    }));
     res.json({ stats });
  } catch (err: any) {
     res.status(500).json({ error: "Server error" });
  }
};

export const getReferralStats = async (req: Request, res: Response) => {
  try {
    const referrals = await UsedReferral.find()
      .populate("referrerUserId", "name email")
      .populate("referredUserId", "name email");
     res.json({ referrals });
  } catch (err: any) {
     res.status(500).json({ error: "Server error" });
  }
};