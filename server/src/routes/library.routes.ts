import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  addToLibraryHandler,
  deleteLibraryItemHandler,
  listLibraryHandler,
  updateLibraryItemHandler,
} from "../controllers/library.controller";

export const libraryRouter = Router();

libraryRouter.use(requireAuth);

libraryRouter.post("/", addToLibraryHandler);
libraryRouter.get("/", listLibraryHandler);
libraryRouter.put("/:itemId", updateLibraryItemHandler);
libraryRouter.delete("/:itemId", deleteLibraryItemHandler);
