import type { Request, Response } from "express";
import { pool } from "../config/db";
import { normalizeSearch } from "../utils/normalize";

// Small helper: UUID-ish validation (good enough for bootcamp; avoids extra deps)
function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

type AliasType = "title" | "author" | "abbr" | "other";

function isAliasType(x: any): x is AliasType {
  return x === "title" || x === "author" || x === "abbr" || x === "other";
}

export async function listSeferAliases(req: Request, res: Response) {
  const seferId = String((req.params as any).id);
  const userId = req.user?.userId as string | undefined; // from your requireAuth middleware

  if (!isUuid(seferId)) {
    return res.status(400).json({ error: "Invalid sefer id" });
  }
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const result = await pool.query(
    `SELECT id, sefer_id, type, value, language, created_at
     FROM sefer_aliases
     WHERE sefer_id = $1
       AND (user_id = $2 OR user_id IS NULL)
     ORDER BY type, value`,
    [seferId, userId],
  );

  return res.json({ aliases: result.rows });
}

export async function createSeferAlias(req: Request, res: Response) {
  const seferId = String((req.params as any).id);
  const userId = req.user?.userId as string | undefined;

  if (!isUuid(seferId)) {
    return res.status(400).json({ error: "Invalid sefer id" });
  }
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const body = (req.body ?? {}) as Record<string, unknown>;
  const type = body.type;
  const value = typeof body.value === "string" ? body.value.trim() : "";
  const language =
    body.language === "en" ||
    body.language === "he" ||
    body.language === "mixed"
      ? body.language
      : null;

  if (!isAliasType(type)) {
    return res
      .status(400)
      .json({ error: "type must be one of: title, author, abbr, other" });
  }
  if (!value) {
    return res.status(400).json({ error: "value is required" });
  }

  const normalized = normalizeSearch(value);
  if (!normalized) {
    return res.status(400).json({ error: "value normalizes to empty string" });
  }

  // (Optional but recommended) Validate the sefer exists
  const seferCheck = await pool.query(`SELECT id FROM "Sefer" WHERE id = $1`, [
    seferId,
  ]);
  if (seferCheck.rowCount === 0) {
    return res.status(404).json({ error: "Sefer not found" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO sefer_aliases (sefer_id, type, value, normalized, language, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, sefer_id, type, value, normalized, language, user_id, created_at`,
      [seferId, type, value, normalized, language, userId],
    );

    return res.status(201).json({ alias: result.rows[0] });
  } catch (e: any) {
    // Duplicate (unique index)
    if (e?.code === "23505") {
      return res.status(409).json({ error: "Alias already exists" });
    }
    // Any other DB error
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function bulkSeferAliases(req: Request, res: Response) {
  const userId = req.user?.userId as string | undefined;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const body = (req.body ?? {}) as Record<string, unknown>;
  const seferIdsRaw = body.seferIds;

  if (!Array.isArray(seferIdsRaw)) {
    return res.status(400).json({ error: "seferIds must be an array" });
  }

  // Validate UUIDs + dedupe
  const seferIds = Array.from(
    new Set(
      seferIdsRaw
        .map((x) => (typeof x === "string" ? x : ""))
        .filter((x) => isUuid(x)),
    ),
  );

  if (seferIds.length === 0) {
    return res.json({ aliasesBySeferId: {} });
  }

  const result = await pool.query(
    `
    SELECT id, sefer_id, type, value, normalized, language, created_at
    FROM sefer_aliases
    WHERE sefer_id = ANY($1::uuid[])
      AND (user_id = $2 OR user_id IS NULL)
    ORDER BY sefer_id, type, value
    `,
    [seferIds, userId],
  );

  const aliasesBySeferId: Record<string, any[]> = {};
  for (const row of result.rows) {
    (aliasesBySeferId[row.sefer_id] ??= []).push(row);
  }

  return res.json({ aliasesBySeferId });
}

export async function deleteSeferAlias(req: Request, res: Response) {
  const seferId = String((req.params as any).id);
  const aliasIdRaw = String((req.params as any).aliasId);
  const userId = req.user?.userId as string | undefined;

  if (!isUuid(seferId)) {
    return res.status(400).json({ error: "Invalid sefer id" });
  }
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const aliasId = Number(aliasIdRaw);
  if (!Number.isInteger(aliasId) || aliasId <= 0) {
    return res.status(400).json({ error: "Invalid alias id" });
  }

  // Important: ensure they can only delete their own aliases,
  // and also ensure it belongs to this seferId (route safety)
  const result = await pool.query(
    `DELETE FROM sefer_aliases
     WHERE id = $1 AND sefer_id = $2 AND user_id = $3
     RETURNING id`,
    [aliasId, seferId, userId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Alias not found" });
  }

  return res.json({ deletedId: result.rows[0].id });
}
