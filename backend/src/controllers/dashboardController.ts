import { Request, Response } from 'express';
import {User} from '../models/User';
import Wallet from '../models/Wallet';

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Total registered users
    const totalUsers = await User.countDocuments();
    
    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.countDocuments({
      loginHistory: { $elemMatch: { $gte: thirtyDaysAgo } }
    });
    
    // Total wallet balance
    const walletStats = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" },
          averageBalance: { $avg: "$balance" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalWallets: walletStats[0]?.count || 0,
        totalBalance: walletStats[0]?.totalBalance || 0,
        averageBalance: walletStats[0]?.averageBalance || 0
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// Get users with pagination and wallet info
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sortBy = (req.query.sortBy as string) || 'lastLogin';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    const statusFilter = req.query.status as string | undefined;
    const searchQuery = req.query.search as string | undefined;

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'wallets',
          localField: '_id',
          foreignField: 'userId',
          as: 'wallet'
        }
      },
      {
        $unwind: {
          path: '$wallet',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          lastLogin: { $arrayElemAt: ['$loginHistory', -1] },
          status: {
            $cond: {
              if: {
                $gte: [
                  { $arrayElemAt: ['$loginHistory', -1] },
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ]
              },
              then: 'active',
              else: 'inactive'
            }
          }
        }
      }
    ];

    // Add search filter if provided
    if (searchQuery) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      });
    }

    // Add status filter if provided
    if (statusFilter) {
      pipeline.push({
        $match: {
          status: statusFilter
        }
      });
    }

    // Count total before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await User.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    // Add sorting, pagination, and final projection
    pipeline.push(
      { $sort: { [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          lastLogin: 1,
          walletBalance: '$wallet.balance',
          walletId: '$wallet._id',
          status: 1
        }
      }
    );

    const users = await User.aggregate(pipeline);

    res.json({
      success: true,
      data: {
        users,
        total,
        page,
        pages: Math.ceil(total / limit),
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get user details by ID
export const getUserDetails = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const wallet = await Wallet.findOne({ userId: user._id });
    
    res.json({
      success: true,
      data: {
        ...user.toObject(),
        wallet: wallet || {
          balance: 0,
          currency: 'USD',
          transactions: []
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};