import type { Request, Response } from "express";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../models/user.model";

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body ?? {};

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Email, password, and name are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedName = String(name).trim();

  const exists = await findUserByEmail(normalizedEmail);
  if (exists) {
    return res.status(400).json({ error: "Email already in use" });
  }

  const passwordHash = await hashPassword(String(password));

  const user = await createUser(normalizedEmail, normalizedName, passwordHash);

  const token = signToken({ userId: user.id, email: user.email });

  return res.status(201).json({
    token,
    user, // {id, email, name}
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const ok = await verifyPassword(String(password), user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ userId: user.id, email: user.email });

  return res.status(200).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

export async function me(req: Request, res: Response) {
  // ✅ no `as any` — this relies on your express.d.ts augmentation
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await findUserById(req.user.userId);

  // If user was deleted, still return token identity (handy for debugging)
  return res.status(200).json({
    user: user ?? { id: req.user.userId, email: req.user.email },
  });
}
