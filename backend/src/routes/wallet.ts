import express from "express";
import { 
  getWalletBalance, 
  getTransactions, 
  withdrawFunds 
} from "../controllers/wallet";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.get("/balance", authenticate, getWalletBalance);
router.get("/transactions", authenticate, getTransactions);
router.post("/withdraw", authenticate, withdrawFunds);

export default router;