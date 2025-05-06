import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticate = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Authentication required");

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select("-password");

    if (!user) throw new Error("User not found");
    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const isAdmin = (
  req: any,
  res: Response,
  next: NextFunction
) => {


  if (req.user?.isAdmin !== true) {
     res.status(403).json({ error: "Admin access required" });
  }
  next();
};