import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  listSeferAliases,
  createSeferAlias,
  deleteSeferAlias,
} from "../controllers/seferAliases.controller";

const router = Router();

// /api/sefarim/:id/aliases
router.get("/:id/aliases", requireAuth, listSeferAliases);
router.post("/:id/aliases", requireAuth, createSeferAlias);
router.delete("/:id/aliases/:aliasId", requireAuth, deleteSeferAlias);

export default router;
