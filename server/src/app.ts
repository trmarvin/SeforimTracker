import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes";
import { healthRouter } from "./routes/health.routes";
import { seferRouter } from "./routes/sefer.routes";
import { libraryRouter } from "./routes/library.routes";
import seferAliasesRoutes from "./routes/seferAliases.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());

app.disable("etag");

app.use((req, res, next) => {
  // apply to API calls (anything with Authorization OR your API paths)
  if (req.header("Authorization") || req.path.includes("/aliases")) {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("Vary", "Authorization");
  }
  next();
});

app.use("/auth", authRoutes);
app.use("/health", healthRouter);
app.use("/seforim", seferRouter);
app.use("/library", libraryRouter);
app.use("/seforim", seferAliasesRoutes);

// basic 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

export default app;
