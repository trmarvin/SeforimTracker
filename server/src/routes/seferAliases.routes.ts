import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  listSeferAliases,
  createSeferAlias,
  deleteSeferAlias,
  bulkSeferAliases,
} from "../controllers/seferAliases.controller";

const router = Router();

router.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// /api/seforim/:id/aliases
router.get("/:id/aliases", requireAuth, listSeferAliases);
router.post("/:id/aliases", requireAuth, createSeferAlias);
router.delete("/:id/aliases/:aliasId", requireAuth, deleteSeferAlias);
router.post("/aliases/bulk", requireAuth, bulkSeferAliases);

export default router;
