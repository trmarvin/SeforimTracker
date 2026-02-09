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
