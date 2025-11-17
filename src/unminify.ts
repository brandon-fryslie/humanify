import fs from "fs/promises";
import { ensureFileExists } from "./file-utils.js";
import { webcrack } from "./plugins/webcrack.js";
import { verbose } from "./verbose.js";
import { instrumentation } from "./instrumentation.js";
import { memoryMonitor } from "./memory-monitor.js";
import * as cliProgress from "cli-progress";
import { splitFile, type SplitOptions } from "./file-splitter.js";
import { processChunk } from "./chunk-processor.js";
import { reassembleChunks } from "./chunk-reassembler.js";
import { deleteCheckpoint } from "./checkpoint.js";
import { VisitResult } from "./plugins/local-llm-rename/visit-all-identifiers.js";
import { GlobalProgressManager, formatETA } from "./global-progress.js";
import { DisplayManager } from "./display-manager.js";

export interface UnminifyOptions {
  chunkSize?: number;
  enableChunking?: boolean;  // Default: true
  debugChunks?: boolean;     // Default: false
  progressManager?: GlobalProgressManager;
  displayManager?: DisplayManager;
  skipWebcrack?: boolean;    // Skip webcrack extraction (default: false). Used for refinement passes where files are already extracted.
}

// Helper to extract code and checkpoint ID from plugin result
function extractPluginResult(result: string | VisitResult): { code: string; checkpointId: string | null } {
  if (typeof result === 'string') {
    // Backward compatibility: string return = no checkpoint
    return { code: result, checkpointId: null };
  } else {
    // New format: { code, checkpointId }
    return { code: result.code, checkpointId: result.checkpointId };
  }
}

export async function unminify(
  filename: string,
  outputDir: string,
  plugins: ((code: string) => Promise<string | VisitResult>)[] = [],
  options: UnminifyOptions = {}
) {
  const rootSpan = instrumentation.startSpan("unminify", {
    filename,
    outputDir,
    pluginCount: plugins.length
  });

  const { progressManager, displayManager } = options;

  try {
    console.log(`\n=== Starting Humanify ===`);
    console.log(`Input file: ${filename}`);
    console.log(`Output directory: ${outputDir}`);
    console.log(`Plugins: ${plugins.length} configured\n`);

    ensureFileExists(filename);

    const bundledCode = await instrumentation.measure(
      "read-input-file",
      () => fs.readFile(filename, "utf-8"),
      { fileSize: 0 }
    );

    memoryMonitor.checkpoint("input-read");

    rootSpan.setAttribute("inputSize", bundledCode.length);

    // Handle webcrack - skip if this is a refinement pass
    let extractedFiles: { path: string }[];

    if (options.skipWebcrack) {
      // Refinement pass: file is already extracted, use as-is
      console.log(`[1/3] Skipping webcrack (already unbundled)...`);
      extractedFiles = [{ path: filename }];
      console.log(`  → Using 1 file directly\n`);
    } else {
      // Initial pass: extract bundles with webcrack
      console.log(`[1/3] Running webcrack to extract bundles...`);
      extractedFiles = await instrumentation.measure(
        "webcrack",
        () => webcrack(bundledCode, outputDir),
        { inputSize: bundledCode.length }
      );
      console.log(`  → Extracted ${extractedFiles.length} file(s)\n`);
    }

    memoryMonitor.checkpoint("webcrack");

    rootSpan.setAttribute("extractedFiles", extractedFiles.length);

    for (let i = 0; i < extractedFiles.length; i++) {
      const fileSpan = instrumentation.startSpan("process-file", {
        fileIndex: i + 1,
        totalFiles: extractedFiles.length,
        filePath: extractedFiles[i].path
      });

      try {
        const file = extractedFiles[i];

        // Show current file in display manager
        if (displayManager) {
          displayManager.showCurrentFile(file.path, i + 1, extractedFiles.length);
        } else {
          console.log(
            `\n[2/3] Processing file ${i + 1}/${extractedFiles.length}: ${file.path}`
          );
        }

        const code = await instrumentation.measure(
          "read-extracted-file",
          () => fs.readFile(file.path, "utf-8")
        );

        memoryMonitor.checkpoint(`ast-parse-${i + 1}`);

        fileSpan.setAttribute("fileSize", code.length);

        if (code.trim().length === 0) {
          verbose.log(`Skipping empty file ${file.path}`);
          continue;
        }

        // Track checkpoint IDs from all plugins for this file
        const checkpointIds: string[] = [];

        // NEW: Detect if file should be chunked
        const chunkThreshold = options.chunkSize || 100000; // 100KB default
        const shouldChunk =
          options.enableChunking !== false &&  // Not disabled
          code.length > chunkThreshold;        // Over threshold

        let currentCode = code;

        if (shouldChunk) {
          console.log(`\n📦 File size ${code.length} chars exceeds chunk threshold (${chunkThreshold})`);
          console.log(`   Splitting into chunks...`);

          // Split file
          const splitResult = await splitFile(code, {
            maxChunkSize: chunkThreshold,
            minChunkSize: 10000,
            splitStrategy: 'statements'
          });

          console.log(`   ✓ Created ${splitResult.chunks.length} chunk(s)\n`);

          // Process each chunk through all plugins
          const processedChunks = [];

          for (let chunkIdx = 0; chunkIdx < splitResult.chunks.length; chunkIdx++) {
            const chunk = splitResult.chunks[chunkIdx];

            console.log(`\n[Chunk ${chunkIdx + 1}/${splitResult.chunks.length}] Processing (${chunk.code.length} chars, ${chunk.symbols.length} symbols)...`);

            // Apply all plugins to this chunk
            let chunkCode = chunk.code;
            for (let j = 0; j < plugins.length; j++) {
              const pluginNum = j + 1;
              const pluginName = plugins[j].name || `Plugin ${pluginNum}`;
              const isRenamePlugin = pluginName.includes("rename") || pluginName.includes("Rename");

              console.log(
                `  [Plugin ${pluginNum}/${plugins.length}] Running ${pluginName}...`
              );

              const pluginStart = Date.now();
              let progressBar: cliProgress.SingleBar | null = null;
              let timerInterval: NodeJS.Timeout | null = null;

              // Show progress spinner for non-rename plugins (only if no display manager)
              if (!isRenamePlugin && !displayManager) {
                progressBar = new cliProgress.SingleBar({
                  format: `    Processing... |{bar}| Elapsed: {elapsed}s`,
                  barCompleteChar: '\u2588',
                  barIncompleteChar: '\u2591',
                  hideCursor: true,
                  barsize: 40,
                  gracefulExit: true,
                }, cliProgress.Presets.shades_classic);

                progressBar.start(100, 0, { elapsed: '0.0' });

                timerInterval = setInterval(() => {
                  const elapsed = ((Date.now() - pluginStart) / 1000).toFixed(1);
                  const newValue = (progressBar!.value + 2) % 100;
                  progressBar!.update(newValue, { elapsed });
                }, 100);
              }

              try {
                const pluginResult = await instrumentation.measure(
                  `plugin-${pluginName}-chunk-${chunkIdx + 1}`,
                  () => plugins[j](chunkCode),
                  { pluginIndex: pluginNum, pluginName, chunkIndex: chunkIdx + 1 }
                );

                // Extract code and checkpoint ID
                const { code: newCode, checkpointId } = extractPluginResult(pluginResult);
                chunkCode = newCode;

                // Collect checkpoint ID if present
                if (checkpointId) {
                  checkpointIds.push(checkpointId);
                }
              } finally {
                if (progressBar && timerInterval) {
                  clearInterval(timerInterval);
                  const finalElapsed = ((Date.now() - pluginStart) / 1000).toFixed(1);
                  progressBar.update(100, { elapsed: finalElapsed });
                  progressBar.stop();
                }
              }

              const pluginTime = ((Date.now() - pluginStart) / 1000).toFixed(1);
              console.log(`  ✓ ${pluginName} complete [${pluginTime}s]`);
            }

            processedChunks.push({
              code: chunkCode,
              metadata: chunk
            });

            // Memory checkpoint after each chunk
            memoryMonitor.checkpoint(`chunk-${chunkIdx + 1}-processed`);

            // Force GC if available
            if (global.gc) {
              global.gc();
              console.log(`   💾 Triggered garbage collection`);
            }
          }

          // Reassemble chunks
          console.log(`\n🔗 Reassembling ${processedChunks.length} chunk(s)...`);
          currentCode = reassembleChunks(processedChunks, {
            preserveComments: true,
            addChunkMarkers: options.debugChunks || false
          });

          console.log(`   ✓ Reassembly complete`);
        } else {
          // Normal processing (no chunking)
          for (let j = 0; j < plugins.length; j++) {
            const pluginNum = j + 1;
            const pluginName = plugins[j].name || `Plugin ${pluginNum}`;
            const isRenamePlugin = pluginName.includes("rename") || pluginName.includes("Rename");

            console.log(
              `  [Plugin ${pluginNum}/${plugins.length}] Running ${pluginName}...`
            );

            const pluginStart = Date.now();
            let progressBar: cliProgress.SingleBar | null = null;
            let timerInterval: NodeJS.Timeout | null = null;

            // Show progress spinner for non-rename plugins (only if no display manager)
            if (!isRenamePlugin && !displayManager) {
              progressBar = new cliProgress.SingleBar({
                format: `    Processing... |{bar}| Elapsed: {elapsed}s`,
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: true,
                barsize: 40,
                gracefulExit: true,
              }, cliProgress.Presets.shades_classic);

              progressBar.start(100, 0, { elapsed: '0.0' });

              timerInterval = setInterval(() => {
                const elapsed = ((Date.now() - pluginStart) / 1000).toFixed(1);
                const newValue = (progressBar!.value + 2) % 100;
                progressBar!.update(newValue, { elapsed });
              }, 100);
            }

            try {
              const pluginResult = await instrumentation.measure(
                `plugin-${pluginName}`,
                () => plugins[j](currentCode),
                { pluginIndex: pluginNum, pluginName }
              );

              // Extract code and checkpoint ID
              const { code: newCode, checkpointId } = extractPluginResult(pluginResult);
              currentCode = newCode;

              // Collect checkpoint ID if present
              if (checkpointId) {
                checkpointIds.push(checkpointId);
              }
            } finally {
              if (progressBar && timerInterval) {
                clearInterval(timerInterval);
                const finalElapsed = ((Date.now() - pluginStart) / 1000).toFixed(1);
                progressBar.update(100, { elapsed: finalElapsed });
                progressBar.stop();
              }
            }

            const pluginTime = ((Date.now() - pluginStart) / 1000).toFixed(1);

            // Memory checkpoint after each plugin
            if (isRenamePlugin) {
              memoryMonitor.checkpoint(`plugin-${pluginName}`);
            }

            console.log(`  ✓ ${pluginName} complete [${pluginTime}s]`);
          }
        }

        verbose.log("Input: ", code);
        verbose.log("Output: ", currentCode);

        fileSpan.setAttribute("outputSize", currentCode.length);

        console.log(`[3/3] Writing output to ${file.path}`);

        // Write file with error handling to preserve checkpoints on failure
        try {
          await instrumentation.measure(
            "write-output-file",
            () => fs.writeFile(file.path, currentCode)
          );

          // Delete checkpoints ONLY after successful file write
          if (checkpointIds.length > 0) {
            for (const checkpointId of checkpointIds) {
              deleteCheckpoint(checkpointId);
            }
          }
        } catch (writeError) {
          // File write failed - preserve checkpoints for recovery
          console.error(`\n❌ ERROR: Failed to write output file: ${writeError}`);

          if (checkpointIds.length > 0) {
            console.error(`\n💾 Checkpoint(s) preserved for recovery:`);
            for (const checkpointId of checkpointIds) {
              console.error(`   - Checkpoint ID: ${checkpointId}`);
            }
            console.error(`\nYou can resume processing later by running the same command again.`);
            console.error(`The checkpoint will automatically be detected and processing will continue from where it left off.`);
          }

          throw writeError; // Re-throw to propagate the error
        }

        memoryMonitor.checkpoint(`output-generation-${i + 1}`);
      } finally {
        fileSpan.end();
      }
    }

    console.log(
      `\n✓ Done! You can find your unminified code in ${outputDir}\n`
    );
  } finally {
    rootSpan.end();
  }
}
