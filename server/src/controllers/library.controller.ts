import type { Request, Response } from "express";
import {
  addToLibrary,
  listLibrary,
  updateLibraryItem,
  deleteLibraryItem,
} from "../models/library.model";

function pgIsUniqueViolation(err: unknown) {
  return (
    typeof err === "object" && err !== null && (err as any).code === "23505"
  );
}

function toTrimmedString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const v = value.trim();
    return v.length > 0 ? v : undefined;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    const v = value[0].trim();
    return v.length > 0 ? v : undefined;
  }
  return undefined;
}

export async function addToLibraryHandler(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const body = (req.body ?? {}) as Record<string, unknown>;

  const seferId = toTrimmedString(body.seferId);
  const status = toTrimmedString(body.status);
  const notes = toTrimmedString(body.notes);

  if (!seferId) {
    return res.status(400).json({ error: "seferId is required" });
  }

  // Build payload without passing undefined optional properties
  const payload: {
    userId: string;
    seferId: string;
    status?: string;
    notes?: string;
  } = {
    userId: req.user.userId,
    seferId,
  };

  if (status) payload.status = status;
  if (notes) payload.notes = notes;

  try {
    const item = await addToLibrary(payload);
    return res.status(201).json({ item });
  } catch (err) {
    if (pgIsUniqueViolation(err)) {
      return res.status(409).json({ error: "Sefer already in library" });
    }
    throw err;
  }
}

export async function listLibraryHandler(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const items = await listLibrary(req.user.userId);
  return res.status(200).json({ items });
}

export async function updateLibraryItemHandler(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  // req.params.id should be string, but we normalize anyway to satisfy TS
  const itemId = toTrimmedString(req.params.itemId);
  if (!itemId) {
    return res.status(400).json({ error: "itemId is required" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  const status = toTrimmedString(body.status);

  // notes can be string OR explicit null (to clear)
  const notes = body.notes === null ? null : toTrimmedString(body.notes);

  const payload: {
    userId: string;
    itemId: string;
    status?: string;
    notes?: string | null;
  } = {
    userId: req.user.userId,
    itemId,
  };

  if (status) payload.status = status;

  // notes can be string OR explicit null (to clear). If undefined, omit it.
  if (body.notes === null) {
    payload.notes = null;
  } else {
    const n = toTrimmedString(body.notes);
    if (n !== undefined) payload.notes = n;
  }

  const updated = await updateLibraryItem(payload);

  if (!updated) return res.status(404).json({ error: "Not found" });

  return res.status(200).json({ item: updated });
}

export async function deleteLibraryItemHandler(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const itemId = toTrimmedString(req.params.itemId);
  if (!itemId) {
    return res.status(400).json({ error: "itemId is required" });
  }

  const ok = await deleteLibraryItem({ userId: req.user.userId, itemId });

  if (!ok) return res.status(404).json({ error: "Not found" });

  return res.status(204).send();
}
