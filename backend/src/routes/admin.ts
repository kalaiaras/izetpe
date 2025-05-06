import express from "express";
import { 
  getAllUsers, 
  getLoginStats, 
  getReferralStats 
} from "../controllers/admin";
import { authenticate, isAdmin } from "../middleware/auth";

const router = express.Router();

router.get("/users", authenticate, isAdmin, getAllUsers);
router.get("/logins", authenticate, isAdmin, getLoginStats);
router.get("/referrals", authenticate, isAdmin, getReferralStats);

export default router;