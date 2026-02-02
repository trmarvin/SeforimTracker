import { Router } from "express";
import { pool } from "../config/db";

export const healthRouter = Router();

healthRouter.get("/db", async (_req, res) => {
  const result = await pool.query("SELECT now() as now");
  res.json({ ok: true, now: result.rows[0].now });
});
