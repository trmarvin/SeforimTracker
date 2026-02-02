import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    req.user = verifyToken(token); // ✅ typed, no `as any`
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
