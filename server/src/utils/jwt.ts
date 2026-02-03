import jwt from "jsonwebtoken";
import type { JwtUserPayload } from "../types/jwt";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return secret;
};

export function signToken(payload: JwtUserPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtUserPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }

  // Narrow the type safely
  const { userId, email } = decoded as Partial<JwtUserPayload>;

  if (typeof userId !== "string" || typeof email !== "string") {
    throw new Error("Malformed token payload");
  }

  return { userId, email };
}
