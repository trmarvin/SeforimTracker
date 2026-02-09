import type { Request, Response } from "express";
import {
  createSefer,
  searchSeforim,
  getSeferById,
  updateSefer,
  deleteSefer,
  SeferInUseError,
  DuplicateSeferError,
} from "../models/sefer.model";

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

  // ✅ validation stays OUTSIDE try
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    // ✅ createSefer goes INSIDE try
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
  } catch (err) {
    // ✅ domain error handled here
    if (err instanceof DuplicateSeferError) {
      return res.status(409).json({
        error: "Sefer already exists",
        existingSeferId: err.existingId,
      });
    }

    // anything else is a real server error
    throw err;
  }
}

export async function searchSeforimHandler(req: Request, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const seforim = await searchSeforim(q, 25);
  return res.status(200).json({ seforim });
}

export async function getSeferHandler(req: Request, res: Response) {
  const seferId =
    typeof req.params.seferId === "string" ? req.params.seferId : "";
  if (!seferId) return res.status(400).json({ error: "seferId is required" });

  const sefer = await getSeferById(seferId);
  if (!sefer) return res.status(404).json({ error: "Not found" });

  return res.status(200).json({ sefer });
}

export async function updateSeferHandler(req: Request, res: Response) {
  const seferId =
    typeof req.params.seferId === "string" ? req.params.seferId : "";
  if (!seferId) return res.status(400).json({ error: "seferId is required" });

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

  try {
    const sefer = await updateSefer({
      seferId,
      title: title.trim(),
      title_he: title_he ? title_he.trim() : null,
      author: author ? author.trim() : null,
      author_he: author_he ? author_he.trim() : null,
      genre: genre ? genre.trim() : null,
      description: description ? description.trim() : null,
      description_he: description_he ? description_he.trim() : null,
      cover_image: cover_image ? cover_image.trim() : null,
    });

    if (!sefer) return res.status(404).json({ error: "Not found" });

    return res.status(200).json({ sefer });
  } catch (err) {
    if (err instanceof DuplicateSeferError) {
      return res.status(409).json({
        error: "Sefer already exists",
        existingSeferId: err.existingId,
      });
    }
    throw err;
  }
}

export async function deleteSeferHandler(req: Request, res: Response) {
  const seferId =
    typeof req.params.seferId === "string" ? req.params.seferId : "";
  if (!seferId) return res.status(400).json({ error: "seferId is required" });

  try {
    const ok = await deleteSefer(seferId);
    if (!ok) return res.status(404).json({ error: "Not found" });

    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof SeferInUseError) {
      return res.status(409).json({
        error: "Cannot delete: sefer exists in one or more library items",
      });
    }
    throw err;
  }
}

export const listSeforimHandler = searchSeforimHandler;
