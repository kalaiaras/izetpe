import { Request, Response, NextFunction, RequestHandler } from "express";
import { validationResult } from "express-validator";

// Explicitly declare type as RequestHandler to satisfy Express types
export const validateRequest: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};
