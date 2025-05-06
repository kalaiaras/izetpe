import express from "express";
import { register, login } from "../controllers/auth";
import { validateRequest } from "../middleware/validate";
import { body } from "express-validator";

const router = express.Router();

// Register a new user
router.post(  "/register",  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("referralCode").optional().trim(),
  ],
  validateRequest,
  register
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

export default router;