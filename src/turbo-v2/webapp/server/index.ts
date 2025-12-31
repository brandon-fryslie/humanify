/**
 * Express server for Turbo-V2 Experiment Dashboard
 */

import express from "express";
import cors from "cors";
import { experimentsRouter } from "./api/experiments.js";
import { runnerRouter } from "./api/runner.js";

const app = express();
const PORT = 3456;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/experiments", experimentsRouter);
app.use("/api/experiments", runnerRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`[turbo-v2-dashboard] Server running on http://localhost:${PORT}`);
  console.log(`[turbo-v2-dashboard] API available at http://localhost:${PORT}/api`);
});
