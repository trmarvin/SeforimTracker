import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  listReadingLogs,
  createReadingLog,
} from "../controllers/readingLogs.controller";

const router = Router();

// /seforim/:id/logs
router.get("/:id/logs", requireAuth, listReadingLogs);
router.post("/:id/logs", requireAuth, createReadingLog);

export default router;
