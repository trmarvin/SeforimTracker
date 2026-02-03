import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import { healthRouter } from "./routes/health.routes";
import { seferRouter } from "./routes/sefer.routes";
import { libraryRouter } from "./routes/library.routes";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(errorHandler);
app.use("/auth", authRoutes);
app.use("/health", healthRouter);
app.use("/seforim", seferRouter);
app.use("/library", libraryRouter);

//health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

//basic 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
