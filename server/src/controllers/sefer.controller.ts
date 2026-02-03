import type { Request, Response } from "express";
import { createSefer, searchSeforim } from "../models/sefer.model";

export async function createSeferHandler(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, unknown>;

  const title = typeof body.title === "string" ? body.title : "";
  const title_he =
    typeof body.title_he === "string" ? body.title_he : undefined;
  const author = typeof body.author === "string" ? body.author : undefined;
  const author_he =
    typeof body.author_he === "string" ? body.author_he : undefined;
  const genre = typeof body.genre === "string" ? body.genre : undefined;
  const description =
    typeof body.description === "string" ? body.description : undefined;
  const description_he =
    typeof body.description_he === "string" ? body.description_he : undefined;
  const cover_image =
    typeof body.cover_image === "string" ? body.cover_image : undefined;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: "Title is required" });
  }

  const sefer = await createSefer({
    title: title.trim(),
    title_he: title_he ? title_he.trim() : null,
    author: author ? author.trim() : null,
    author_he: author_he ? author_he.trim() : null,
    genre: genre ? genre.trim() : null,
    description: description ? description.trim() : null,
    description_he: description_he ? description_he.trim() : null,
    cover_image: cover_image ? cover_image.trim() : null,
  });

  return res.status(201).json({ sefer });
}

export async function searchSeforimHandler(req: Request, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const seforim = await searchSeforim(q, 25);
  return res.status(200).json({ seforim });
}
