import type { Request, Response } from "express";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";

// temp fake db
const users: Array<{
  id: number;
  email: string;
  name: string;
  passwordHash: string;
}> = [];

let nextUserId = 1;

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body ?? {};

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Email, password, and name are required" });
  }

  const exists = users.some((u) => u.email === email);
  if (exists) {
    return res.status(400).json({ error: "Email already in use" });
  }

  const passwordHash = await hashPassword(password);

  const user = { id: nextUserId++, email, name, passwordHash };
  users.push(user);

  const token = signToken({ userId: user.id, email: user.email });

  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ userId: user.id, email: user.email });

  return res.status(200).json({
    token,
    user: { id: user.id, email: user.email },
  });
}

export async function me(req: Request, res: Response) {
  const payload = (req as any).user as
    | { userId: number; email: string }
    | undefined;
  if (!payload) return res.status(500).json({ error: "Auth payload missing" });

  const user = users.find((u) => u.id === payload.userId);

  return res.status(200).json({
    user: user
      ? { id: user.id, email: user.email, name: user.name }
      : { id: payload.userId, email: payload.email },
  });
}
