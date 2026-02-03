import { pool } from "../config/db";

/**
 * Raw LibraryItem row from DB.
 * (Matches table: "LibraryItem")
 */
export type LibraryItemRow = {
  id: string;
  user_id: string;
  sefer_id: string;
  status: string; // later: enum
  notes: string | null; // later: markdown
  created_at: string;
  updated_at: string;
};

/**
 * View model for listing library with embedded sefer metadata.
 */
export type LibraryItemView = {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  sefer: {
    id: string;
    title: string;
    title_he: string | null;
    author: string | null;
    author_he: string | null;
    genre: string | null;
    description: string | null;
    description_he: string | null;
    cover_image: string | null;
  };
};

export async function addToLibrary(params: {
  userId: string;
  seferId: string;
  status?: string;
  notes?: string;
}): Promise<LibraryItemRow> {
  const { userId, seferId, status, notes } = params;

  const { rows } = await pool.query<LibraryItemRow>(
    `INSERT INTO "LibraryItem" (user_id, sefer_id, status, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, sefer_id, status, notes, created_at, updated_at`,
    [userId, seferId, status ?? "to_read", notes ?? null],
  );

  const item = rows[0];
  if (!item) throw new Error("Failed to add to library (no row returned)");
  return item;
}

export async function listLibrary(userId: string): Promise<LibraryItemView[]> {
  const { rows } = await pool.query<LibraryItemView>(
    `SELECT
       li.id,
       li.status,
       li.notes,
       li.created_at,
       li.updated_at,
       json_build_object(
         'id', s.id,
         'title', s.title,
         'title_he', s.title_he,
         'author', s.author,
         'author_he', s.author_he,
         'genre', s.genre,
         'description', s.description,
         'description_he', s.description_he,
         'cover_image', s.cover_image
       ) AS sefer
     FROM "LibraryItem" li
     JOIN "Sefer" s ON s.id = li.sefer_id
     WHERE li.user_id = $1
     ORDER BY li.updated_at DESC`,
    [userId],
  );

  return rows;
}

export async function updateLibraryItem(params: {
  userId: string;
  itemId: string;
  status?: string;
  notes?: string | null;
}): Promise<LibraryItemRow | null> {
  const { userId, itemId, status, notes } = params;

  const { rows } = await pool.query<LibraryItemRow>(
    `UPDATE "LibraryItem"
     SET
       status = COALESCE($3, status),
       notes = COALESCE($4, notes)
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, sefer_id, status, notes, created_at, updated_at`,
    [itemId, userId, status ?? null, notes ?? null],
  );

  return rows[0] ?? null;
}

export async function deleteLibraryItem(params: {
  userId: string;
  itemId: string;
}): Promise<boolean> {
  const { userId, itemId } = params;

  const result = await pool.query(
    `DELETE FROM "LibraryItem"
     WHERE id = $1 AND user_id = $2`,
    [itemId, userId],
  );

  return result.rowCount === 1;
}
