
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";


declare module "express" {
  interface Request {
    userId?: string;
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return; 
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    req.userId = decoded.userId; 
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};
