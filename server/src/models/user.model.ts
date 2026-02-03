import { pool } from "../config/db";

export type UserRow = {
  id: string; //UUID
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
};

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT id, email, name, password_hash, created_at
     FROM "User"
     WHERE email = $1
     LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findUserById(
  userId: string,
): Promise<Pick<UserRow, "id" | "email" | "name"> | null> {
  const { rows } = await pool.query<Pick<UserRow, "id" | "email" | "name">>(
    `SELECT id, email, name
     FROM "User"
     WHERE id = $1
     LIMIT 1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function createUser(
  email: string,
  name: string,
  passwordHash: string,
): Promise<Pick<UserRow, "id" | "email" | "name">> {
  const { rows } = await pool.query<Pick<UserRow, "id" | "email" | "name">>(
    `INSERT INTO "User" (email, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, name`,
    [email, name, passwordHash],
  );

  const user = rows[0];
  if (!user) {
    throw new Error("Failed to create user (no row returned)");
  }

  return user;
}
