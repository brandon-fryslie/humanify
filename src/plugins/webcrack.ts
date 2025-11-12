import { webcrack as wc } from "webcrack";
import fs from "fs/promises";
import path from "path";
import * as cliProgress from "cli-progress";

type File = {
  path: string;
};

export async function webcrack(
  code: string,
  outputDir: string
): Promise<File[]> {
  const startTime = Date.now();
  let timerInterval: NodeJS.Timeout | null = null;

  // Create an indeterminate progress bar with timer
  const progressBar = new cliProgress.SingleBar({
    format: 'Extracting bundles... |{bar}| Elapsed: {elapsed}s',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    barsize: 40,
    gracefulExit: true,
  }, cliProgress.Presets.shades_classic);

  // Start with indeterminate mode (value = 0, total = 100)
  progressBar.start(100, 0, {
    elapsed: '0.0'
  });

  // Update timer every 100ms
  timerInterval = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    progressBar.update(progressBar.value, { elapsed });

    // Simulate indeterminate progress by cycling
    const newValue = (progressBar.value + 2) % 100;
    progressBar.update(newValue, { elapsed });
  }, 100);

  try {
    const cracked = await wc(code);
    await cracked.save(outputDir);

    const output = await fs.readdir(outputDir);
    const files = output
      .filter((file) => file.endsWith(".js"))
      .map((file) => ({ path: path.join(outputDir, file) }));

    return files;
  } finally {
    // Stop timer and show final elapsed time
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    const finalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    progressBar.update(100, { elapsed: finalElapsed });
    progressBar.stop();

    // Print final locked-in time
    console.log(`  ✓ Extraction complete [${finalElapsed}s]`);
  }
}
