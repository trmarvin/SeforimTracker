import { Router } from "express";
import {
  createSeferHandler,
  listSeforimHandler,
  getSeferHandler,
  updateSeferHandler,
  deleteSeferHandler,
} from "../controllers/sefer.controller";

export const seferRouter = Router();

seferRouter.post("/", createSeferHandler);
seferRouter.get("/", listSeforimHandler);

seferRouter.get("/:seferId", getSeferHandler);
seferRouter.put("/:seferId", updateSeferHandler);
seferRouter.delete("/:seferId", deleteSeferHandler);
