/**
 * Express server for webapp-v2
 * Basic structure copied from webapp/server/index.ts
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

const app = express();
const PORT = 3458; // Different port from webapp (3456)

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`[webapp-v2] Server running on http://localhost:${PORT}`);
  console.log(`[webapp-v2] API available at http://localhost:${PORT}/api`);

  // Check API key availability
  if (process.env.OPENAI_API_KEY) {
    console.log(`[webapp-v2] OPENAI_API_KEY: configured`);
  } else {
    console.warn(`[webapp-v2] WARNING: OPENAI_API_KEY not found in environment`);
  }
});
