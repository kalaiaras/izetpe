import { Request, Response } from 'express';
import {User} from '../models/User';
import UsedReferral from '../models/UsedReferral';
import { generateReferralCode } from '../utils/referralutils';

// Generate or get user's referral code
export const getReferralCode = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate referral code if doesn't exist
    if (!user.referralCode) {
      user.referralCode = generateReferralCode(user.name);
      await user.save();
    }

    res.json({ 
      success: true, 
      data: { 
        referralCode: user.referralCode,
        totalReferrals: await UsedReferral.countDocuments({ referrerUserId: userId })
      }
    });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Apply a referral code
export const applyReferralCode = async (req: any, res: any) => {
  try {
    const { referralCode } = req.body;
    const userId = req.user?._id;

    // Check if user already used a referral code
    const alreadyUsed = await UsedReferral.findOne({ referredUserId: userId });
    if (alreadyUsed) {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already used a referral code' 
      });
    }

    // Find referrer user
    const referrer : any = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid referral code' 
      });
    }

    // Prevent self-referral
    if (referrer._id.equals(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot use your own referral code' 
      });
    }

    // Create referral record
    const referralRecord = new UsedReferral({
      referralCode,
      referredUserId: userId,
      referrerUserId: referrer._id
    });

    // Update balances (transaction would be better here)
    const BONUS_AMOUNT = 50;
    referrer.walletBalance += BONUS_AMOUNT;
    req.user!.walletBalance += BONUS_AMOUNT;

    // Add transaction history
    referrer.transactions.push({
      amount: BONUS_AMOUNT,
      type: 'REFERRAL_BONUS'
    });

    req.user!.transactions.push({
      amount: BONUS_AMOUNT,
      type: 'REFERRAL_BONUS'
    });

    await Promise.all([
      referralRecord.save(),
      referrer.save(),
      req.user!.save()
    ]);

    res.json({ 
      success: true, 
      data: { 
        bonusAmount: BONUS_AMOUNT,
        referrerName: referrer.name 
      }
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get referral history
export const getReferralHistory = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;

    const referrals = await UsedReferral.find({ referrerUserId: userId })
      .populate('referredUserId', 'name email')
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await UsedReferral.countDocuments({ referrerUserId: userId });

    res.json({
      success: true,
      data: {
        referrals,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error getting referral history:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};