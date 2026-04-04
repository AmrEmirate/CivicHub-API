import { Response, NextFunction } from "express";
import { ProtectedRequest } from "./auth";

export const authorizeFilters = (allowedRoles: string[]) => {
  return (req: ProtectedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: insufficient permissions" });
      return;
    }

    next();
  };
};
