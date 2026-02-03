import { Router } from "express";
import {
  createSeferHandler,
  listSeforimHandler,
} from "../controllers/sefer.controller";

export const seferRouter = Router();

seferRouter.post("/", createSeferHandler);
seferRouter.get("/", listSeforimHandler);
