import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import { healthRouter } from "./routes/health.routes";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(errorHandler);
app.use("/auth", authRoutes);
app.use("/health", healthRouter);

//health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

//basic 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
