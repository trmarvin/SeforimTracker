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
