import express from "express";

const app = express();

//health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
