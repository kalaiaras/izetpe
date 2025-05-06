import express from 'express';
import {
  getReferralCode,
  applyReferralCode,
  getReferralHistory
} from '../controllers/referral';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.use(authenticate);

router.get('/code', getReferralCode);
router.post('/apply', applyReferralCode);
router.get('/history', getReferralHistory);

export default router;