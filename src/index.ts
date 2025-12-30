#!/usr/bin/env -S npx tsx
import { version } from "../package.json";
import { download } from "./commands/download.js";
import { unminifyCommand } from "./commands/unminify.js";
import { checkpointsV2Command } from "./commands/checkpoints-v2.js";
import { cli } from "./cli.js";

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\n\n⚠️  Interrupted by user (Ctrl+C)");
  console.log("Cleaning up...");
  process.exit(130); // Standard exit code for SIGINT
});

process.on("SIGTERM", () => {
  console.log("\n\n⚠️  Terminated by system");
  console.log("Cleaning up...");
  process.exit(143); // Standard exit code for SIGTERM
});

cli()
  .name("humanify")
  .description("Unminify code using OpenAI, Gemini, or a local LLM")
  .version(version)
  .addCommand(unminifyCommand)
  .addCommand(download())
  .addCommand(checkpointsV2Command)
  .parse(process.argv);
