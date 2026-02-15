import type { Request, Response } from "express";
import { pool } from "../config/db";

// same UUID helper (copy/paste from aliases controller)
function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

type RefKind = "daf" | "siman" | "perek" | "shaar";
function isRefKind(x: any): x is RefKind {
  return x === "daf" || x === "siman" || x === "perek" || x === "shaar";
}

function buildRefLabel(
  kind: RefKind,
  daf?: string | null,
  amud?: string | null,
  siman?: string | null,
  seif?: string | null,
  perek?: string | null,
  shaar?: string | null,
) {
  if (kind === "daf") {
    const d = (daf ?? "").trim();
    const a = amud === "a" || amud === "b" ? amud : null;
    return `Daf ${d}${a ? ` ${a}` : ""}`.trim();
  }

  if (kind === "siman") {
    const s = (siman ?? "").trim();
    const sf = (seif ?? "").trim();
    return `Siman ${s}${sf ? ` seif ${sf}` : ""}`.trim();
  }

  if (kind === "perek") {
    const p = (perek ?? "").trim();
    return `Perek ${p}`.trim();
  }

  // shaar
  const sh = (shaar ?? "").trim();
  return `Sha'ar ${sh}`.trim();
}

export async function listReadingLogs(req: Request, res: Response) {
  const seferId = String((req.params as any).id);
  const userId = req.user?.userId as string | undefined;

  if (!isUuid(seferId))
    return res.status(400).json({ error: "Invalid sefer id" });
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const result = await pool.query(
    `
    SELECT id, sefer_id, user_id, ref_kind,
       daf, amud, siman, seif, perek, shaar,
       ref_label, notes, logged_at
    FROM reading_logs
    WHERE sefer_id = $1 AND user_id = $2
    ORDER BY logged_at DESC
    LIMIT 50
    `,
    [seferId, userId],
  );

  return res.json({ logs: result.rows });
}

export async function createReadingLog(req: Request, res: Response) {
  const seferId = String((req.params as any).id);
  const userId = req.user?.userId as string | undefined;

  if (!isUuid(seferId))
    return res.status(400).json({ error: "Invalid sefer id" });
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const body = (req.body ?? {}) as Record<string, unknown>;
  const ref_kind = body.ref_kind;

  if (!isRefKind(ref_kind)) {
    return res.status(400).json({ error: "ref_kind must be 'daf' or 'siman'" });
  }

  const daf = typeof body.daf === "string" ? body.daf.trim() : null;
  const amud = body.amud === "a" || body.amud === "b" ? body.amud : null;

  const siman = typeof body.siman === "string" ? body.siman.trim() : null;
  const seif = typeof body.seif === "string" ? body.seif.trim() : null;

  const perek = typeof body.perek === "string" ? body.perek.trim() : null;
  const shaar = typeof body.shaar === "string" ? body.shaar.trim() : null;

  const notes = typeof body.notes === "string" ? body.notes.trim() : null;

  // minimal validation
  if (ref_kind === "daf") {
    if (!daf)
      return res
        .status(400)
        .json({ error: "daf is required for ref_kind='daf'" });
  }

  if (ref_kind === "siman") {
    if (!siman)
      return res
        .status(400)
        .json({ error: "siman is required for ref_kind='siman'" });
  }

  if (ref_kind === "perek") {
    if (!perek)
      return res
        .status(400)
        .json({ error: "perek is required for ref_kind='perek'" });
  }

  if (ref_kind === "shaar") {
    if (!shaar)
      return res
        .status(400)
        .json({ error: "shaar is required for ref_kind='shaar'" });
  }

  const ref_label = buildRefLabel(
    ref_kind,
    daf,
    amud,
    siman,
    seif,
    perek,
    shaar,
  );

  if (
    !ref_label ||
    ref_label === "Daf" ||
    ref_label === "Siman" ||
    ref_label === "Perek" ||
    ref_label === "Sha'ar"
  ) {
    return res.status(400).json({ error: "Invalid reference" });
  }

  // optional: validate sefer exists (same pattern you used for aliases)
  const seferCheck = await pool.query(`SELECT id FROM "Sefer" WHERE id = $1`, [
    seferId,
  ]);
  if (seferCheck.rowCount === 0)
    return res.status(404).json({ error: "Sefer not found" });

  const result = await pool.query(
    `
    INSERT INTO reading_logs (sefer_id, user_id, ref_kind, daf, amud, siman, seif, perek, shaar, ref_label, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING id, sefer_id, user_id, ref_kind, daf, amud, siman, seif, ref_label, notes, logged_at
    `,
    [
      seferId,
      userId,
      ref_kind,
      daf,
      amud,
      siman,
      seif,
      perek,
      shaar,
      ref_label,
      notes,
    ],
  );

  return res.status(201).json({ log: result.rows[0] });
}
