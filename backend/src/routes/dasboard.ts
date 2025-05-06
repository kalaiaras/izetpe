import express from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserDetails
} from '../controllers/dashboardController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();
// Protected admin routes


router.get('/stats',authenticate, isAdmin, getDashboardStats);
router.get('/users',authenticate,isAdmin, getUsers);
router.get('/users/:id',authenticate, getUserDetails);

export default router;