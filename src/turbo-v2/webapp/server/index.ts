/**
 * Express server for Turbo-V2 Experiment Dashboard
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "../../../..");
config({ path: resolve(PROJECT_ROOT, ".env") });

import express from "express";
import cors from "cors";
import { experimentsRouter } from "./api/experiments.js";
import { runnerRouter } from "./api/runner.js";
import { presetsRouter } from "./api/presets.js";
import { progressRouter } from "./api/progress.js";

const app = express();
const PORT = 3456;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/experiments", experimentsRouter);
app.use("/api/experiments", runnerRouter);
app.use("/api/experiments", progressRouter);
app.use("/api/presets", presetsRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`[turbo-v2-dashboard] Server running on http://localhost:${PORT}`);
  console.log(`[turbo-v2-dashboard] API available at http://localhost:${PORT}/api`);

  // Check API key availability
  if (process.env.OPENAI_API_KEY) {
    console.log(`[turbo-v2-dashboard] OPENAI_API_KEY: configured ✓`);
  } else {
    console.warn(`[turbo-v2-dashboard] WARNING: OPENAI_API_KEY not found in environment`);
  }
});
