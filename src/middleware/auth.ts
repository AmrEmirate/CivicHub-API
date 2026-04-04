import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IJwtPayload } from "../types";

// 🔒 Jika JWT_SECRET tidak ada di .env, generate acak agar tidak bisa ditebak
export const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

export interface ProtectedRequest extends Request {
  user?: IJwtPayload;
}

export const authenticate = (req: ProtectedRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Authentication token missing" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as IJwtPayload;
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
