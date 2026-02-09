import { pool } from "../config/db";

export type SeferRow = {
  id: string;
  title: string;
  title_he: string | null;
  author: string | null;
  author_he: string | null;
  genre: string | null; // later: enum
  description: string | null; // later: markdown
  description_he: string | null; // later: markdown
  cover_image: string | null; // url string to Cloudinary
  created_at: string;
  updated_at: string;
};

// TODO (future):
// - title variants table
// - author entity
// - sefer-to-sefer relationships (commentary, response, etc.)

function norm(s: string) {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

// MVP Hebrew normalization: trim + collapse spaces.
// (We *could* add niqqud stripping later.)
function normHe(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export class DuplicateSeferError extends Error {
  constructor(public existingId: string) {
    super("Sefer already exists");
    this.name = "DuplicateSeferError";
  }
}

export async function createSefer(input: {
  title: string;
  title_he?: string | null;
  author?: string | null;
  author_he?: string | null;
  genre?: string | null;
  description?: string | null;
  description_he?: string | null;
  cover_image?: string | null;
}): Promise<SeferRow> {
  const {
    title,
    title_he,
    author,
    author_he,
    genre,
    description,
    description_he,
    cover_image,
  } = input;

  const dup = await findDuplicateSefer({
    title,
    title_he: title_he ?? null,
    author: author ?? null,
  });

  if (dup) {
    throw new DuplicateSeferError(dup.id);
  }

  const { rows } = await pool.query<SeferRow>(
    `INSERT INTO "Sefer"
      (title, title_he, author, author_he, genre, description, description_he, cover_image)
     VALUES
      ($1,    $2,       $3,     $4,        $5,    $6,          $7,             $8)
     RETURNING
      id, title, title_he, author, author_he, genre, description, description_he, cover_image, created_at, updated_at`,
    [
      title,
      title_he ?? null,
      author ?? null,
      author_he ?? null,
      genre ?? null,
      description ?? null,
      description_he ?? null,
      cover_image ?? null,
    ],
  );

  const sefer = rows[0];
  if (!sefer) throw new Error("Failed to create sefer");
  return sefer;
}

async function findDuplicateSefer(input: {
  title: string;
  title_he?: string | null;
  author?: string | null;
}): Promise<{ id: string } | null> {
  const titleHe = input.title_he ? normHe(input.title_he) : null;

  // 1) Prefer Hebrew title when present
  if (titleHe) {
    const { rows } = await pool.query<{ id: string }>(
      `
      SELECT id
      FROM "Sefer"
      WHERE title_he IS NOT NULL
        AND trim(regexp_replace(title_he, '\\s+', ' ', 'g')) = $1
      LIMIT 1
      `,
      [titleHe],
    );
    return rows[0] ?? null;
  }

  // 2) Fallback: normalized English title + author (author optional but recommended)
  const title = norm(input.title);
  const author = input.author ? norm(input.author) : null;

  const { rows } = await pool.query<{ id: string }>(
    `
    SELECT id
    FROM "Sefer"
    WHERE lower(trim(regexp_replace(title, '\\s+', ' ', 'g'))) = $1
      AND (
        ($2::text IS NULL AND author IS NULL)
        OR lower(trim(regexp_replace(coalesce(author,''), '\\s+', ' ', 'g'))) = $2
      )
    LIMIT 1
    `,
    [title, author],
  );

  return rows[0] ?? null;
}

async function findDuplicateSeferExcludingId(input: {
  excludeId: string;
  title: string;
  title_he?: string | null | undefined;
  author?: string | null | undefined;
}): Promise<{ id: string } | null> {
  // Prefer Hebrew title when present
  if (input.title_he) {
    const titleHe = input.title_he.trim().replace(/\s+/g, " ");

    const { rows } = await pool.query<{ id: string }>(
      `
      SELECT id
      FROM "Sefer"
      WHERE id <> $2
        AND title_he IS NOT NULL
        AND trim(regexp_replace(title_he, '\\s+', ' ', 'g')) = $1
      LIMIT 1
      `,
      [titleHe, input.excludeId],
    );

    return rows[0] ?? null;
  }

  // Fallback: English title + (optional) author
  const title = input.title.trim().replace(/\s+/g, " ").toLowerCase();
  const author = input.author
    ? input.author.trim().replace(/\s+/g, " ").toLowerCase()
    : null;

  const { rows } = await pool.query<{ id: string }>(
    `
    SELECT id
    FROM "Sefer"
    WHERE id <> $3
      AND lower(trim(regexp_replace(title, '\\s+', ' ', 'g'))) = $1
      AND (
        ($2::text IS NULL AND author IS NULL)
        OR lower(trim(regexp_replace(coalesce(author,''), '\\s+', ' ', 'g'))) = $2
      )
    LIMIT 1
    `,
    [title, author, input.excludeId],
  );

  return rows[0] ?? null;
}

export async function getSeferById(seferId: string): Promise<SeferRow | null> {
  const { rows } = await pool.query<SeferRow>(
    `SELECT
       id, title, title_he, author, author_he, genre, description, description_he, cover_image, created_at, updated_at
     FROM "Sefer"
     WHERE id = $1
     LIMIT 1`,
    [seferId],
  );
  return rows[0] ?? null;
}

export async function updateSefer(input: {
  seferId: string;
  title: string;
  title_he?: string | null;
  author?: string | null;
  author_he?: string | null;
  genre?: string | null;
  description?: string | null;
  description_he?: string | null;
  cover_image?: string | null;
}): Promise<SeferRow | null> {
  // duplicate check excluding self
  const dup = await findDuplicateSeferExcludingId({
    excludeId: input.seferId,
    title: input.title,
    title_he: input.title_he ?? null,
    author: input.author ?? null,
  });

  if (dup) {
    throw new DuplicateSeferError(dup.id);
  }

  const { rows } = await pool.query<SeferRow>(
    `UPDATE "Sefer"
     SET
       title = $2,
       title_he = $3,
       author = $4,
       author_he = $5,
       genre = $6,
       description = $7,
       description_he = $8,
       cover_image = $9,
       updated_at = now()
     WHERE id = $1
     RETURNING
       id, title, title_he, author, author_he, genre, description, description_he, cover_image, created_at, updated_at`,
    [
      input.seferId,
      input.title,
      input.title_he ?? null,
      input.author ?? null,
      input.author_he ?? null,
      input.genre ?? null,
      input.description ?? null,
      input.description_he ?? null,
      input.cover_image ?? null,
    ],
  );

  return rows[0] ?? null;
}

export class SeferInUseError extends Error {
  constructor() {
    super("Sefer is in use by library items");
    this.name = "SeferInUseError";
  }
}

export async function deleteSefer(seferId: string): Promise<boolean> {
  // block delete if referenced
  const { rows: refRows } = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM "LibraryItem" WHERE sefer_id = $1
     ) AS exists`,
    [seferId],
  );

  if (refRows[0]?.exists) {
    throw new SeferInUseError();
  }

  const { rowCount } = await pool.query(`DELETE FROM "Sefer" WHERE id = $1`, [
    seferId,
  ]);

  return (rowCount ?? 0) > 0;
}

export async function searchSeforim(
  q?: string,
  limit = 25,
): Promise<SeferRow[]> {
  // If no query, return newest
  if (!q || q.trim().length === 0) {
    const { rows } = await pool.query<SeferRow>(
      `SELECT
         id, title, title_he, author, author_he, genre, description, description_he, cover_image, created_at, updated_at
       FROM "Sefer"
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );
    return rows;
  }

  const query = `%${q.toLowerCase()}%`;

  const { rows } = await pool.query<SeferRow>(
    `SELECT
       id, title, title_he, author, author_he, genre, description, description_he, cover_image, created_at, updated_at
     FROM "Sefer"
     WHERE LOWER(title) LIKE $1
        OR LOWER(COALESCE(title_he, '')) LIKE $1
        OR LOWER(COALESCE(author, '')) LIKE $1
        OR LOWER(COALESCE(author_he, '')) LIKE $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [query, limit],
  );

  return rows;
}
