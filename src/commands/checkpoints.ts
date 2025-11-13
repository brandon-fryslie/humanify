import { Command } from "commander";
import { listCheckpoints, deleteCheckpoint } from "../checkpoint.js";
import prompts from "prompts";

export const checkpointsCommand = new Command("checkpoints")
  .description("Manage checkpoint files");

// clear-checkpoints subcommand
checkpointsCommand
  .command("clear")
  .alias("clean")
  .description("Delete all checkpoint files")
  .action(async () => {
    const checkpoints = listCheckpoints();

    if (checkpoints.length === 0) {
      console.log("No checkpoints found");
      return;
    }

    console.log(`\nFound ${checkpoints.length} checkpoint(s):\n`);
    for (const cp of checkpoints) {
      const percent = Math.round((cp.completedBatches / cp.totalBatches) * 100);
      console.log(`  ${cp.originalFile || cp.inputHash}`);
      console.log(`    Progress: ${cp.completedBatches}/${cp.totalBatches} batches (${percent}%)`);
      console.log(`    Created: ${new Date(cp.timestamp).toLocaleString()}\n`);
    }

    const answer = await prompts({
      type: "confirm",
      name: "confirmed",
      message: `Delete all ${checkpoints.length} checkpoint(s)?`,
      initial: false,
    });

    if (!answer.confirmed) {
      console.log("Cancelled");
      return;
    }

    for (const cp of checkpoints) {
      deleteCheckpoint(cp.inputHash);
    }
    console.log(`\nDeleted ${checkpoints.length} checkpoint(s)`);
  });

// resume subcommand
checkpointsCommand
  .command("resume")
  .description("Resume from an existing checkpoint")
  .action(async () => {
    const checkpoints = listCheckpoints();

    if (checkpoints.length === 0) {
      console.log("No checkpoints found");
      return;
    }

    console.log(`\nFound ${checkpoints.length} checkpoint(s):\n`);

    const choices = checkpoints.map((cp, i) => {
      const percent = Math.round((cp.completedBatches / cp.totalBatches) * 100);
      const file = cp.originalFile || cp.inputHash;
      const provider = cp.originalProvider || "unknown";
      const model = cp.originalModel || "unknown";

      return {
        title: `${file} (${percent}% complete)`,
        description: `Provider: ${provider}, Model: ${model}, ${new Date(cp.timestamp).toLocaleString()}`,
        value: i,
      };
    });

    const answer = await prompts({
      type: "select",
      name: "index",
      message: "Select checkpoint to resume:",
      choices,
      hint: "Use arrow keys to navigate",
    });

    if (answer.index === undefined) {
      console.log("Cancelled");
      return;
    }

    const selected = checkpoints[answer.index];

    console.log(`\nTo resume this checkpoint, run:\n`);

    // Build the command from stored metadata
    const cmd = ["humanify", "unminify", selected.originalFile || "<file>"];

    if (selected.originalProvider) {
      cmd.push("--provider", selected.originalProvider);
    }

    if (selected.originalModel) {
      cmd.push("--model", selected.originalModel);
    }

    if (selected.originalArgs) {
      const args = selected.originalArgs;
      if (args.turbo) cmd.push("--turbo");
      if (args.maxConcurrent) cmd.push("--max-concurrent", String(args.maxConcurrent));
      if (args.contextSize) cmd.push("--context-size", String(args.contextSize));
      if (args.dependencyMode) cmd.push("--dependency-mode", args.dependencyMode);
      if (args.output) cmd.push("--output", String(args.output));
    }

    console.log(`  ${cmd.join(" ")}\n`);
    console.log("The checkpoint will be automatically detected and you can choose to resume.");
  });
