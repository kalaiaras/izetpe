import express from "express";
import { sendMessage, getMessages } from "../controllers/chat";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.post("/send", authenticate, sendMessage);
router.get("/:userId1/:userId2", authenticate, getMessages);

export default router;