import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes";
import { healthRouter } from "./routes/health.routes";
import { seferRouter } from "./routes/sefer.routes";
import { libraryRouter } from "./routes/library.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/health", healthRouter);
app.use("/seforim", seferRouter);
app.use("/library", libraryRouter);

// basic 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

export default app;
