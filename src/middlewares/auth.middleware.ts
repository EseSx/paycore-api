import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { error } from "node:console";

export interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "Token no provisto" });

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalido o expirado" });
  }
};
