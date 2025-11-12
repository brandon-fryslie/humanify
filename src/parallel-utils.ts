import * as cliProgress from "cli-progress";

export interface BatchInfo {
  batchIndex: number;
  totalBatches: number;
}

/**
 * Execute an array of async tasks with a concurrency limit.
 * Returns results in the same order as tasks.
 *
 * @param tasks Array of functions that return promises
 * @param limit Maximum number of concurrent tasks
 * @param onProgress Optional callback called when each task completes
 * @param batchInfo Optional batch information for progress display
 * @returns Array of results in original order
 */
export async function parallelLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
  onProgress?: (completed: number, total: number) => void,
  batchInfo?: BatchInfo
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let completed = 0;
  let inFlight = 0;
  let nextIndex = 0;

  // Create progress bar with custom format
  const batchPrefix = batchInfo
    ? `Batch ${batchInfo.batchIndex}/${batchInfo.totalBatches} | `
    : '';

  const progressBar = new cliProgress.SingleBar({
    format: `${batchPrefix}|{bar}| {percentage}% | {value}/{total} | \x1b[33mActive: {inFlight}\x1b[0m | \x1b[32mCompleted: {completed}\x1b[0m | \x1b[90mPending: {pending}\x1b[0m`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    barsize: 40,
    gracefulExit: true,
  }, cliProgress.Presets.shades_classic);

  progressBar.start(tasks.length, 0, {
    inFlight: 0,
    completed: 0,
    pending: tasks.length
  });

  // Execute a single task and track its result
  const executeTask = async (index: number): Promise<void> => {
    const task = tasks[index];
    inFlight++;
    progressBar.update(completed, {
      inFlight,
      completed,
      pending: tasks.length - completed - inFlight
    });

    const result = await task();
    results[index] = result;
    inFlight--;
    completed++;

    progressBar.update(completed, {
      inFlight,
      completed,
      pending: tasks.length - completed - inFlight
    });

    onProgress?.(completed, tasks.length);
  };

  // Worker function that continuously picks up new tasks
  const worker = async (): Promise<void> => {
    while (nextIndex < tasks.length) {
      const index = nextIndex++;
      await executeTask(index);
    }
  };

  try {
    // Start workers (up to limit or total tasks, whichever is smaller)
    const workerCount = Math.min(limit, tasks.length);
    const workers: Promise<void>[] = [];

    for (let i = 0; i < workerCount; i++) {
      workers.push(worker());
    }

    // Wait for all workers to complete
    await Promise.all(workers);

    return results;
  } finally {
    // Always stop progress bar, even on error or interrupt
    progressBar.stop();
  }
}
