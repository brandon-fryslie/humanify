/**
 * useExperimentProgress Hook
 *
 * React hook for subscribing to real-time experiment progress via SSE.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { SampleName } from "../../shared/types.js";

/**
 * Progress state tracked by the hook
 */
export interface ProgressState {
  status: "idle" | "connecting" | "running" | "completed" | "failed";

  // Pass progress
  currentPass: number;
  totalPasses: number;
  passProcessor?: string;

  // Batch progress
  currentBatch: number;
  totalBatches: number;

  // Sample progress
  currentSample?: SampleName;
  completedSamples: number;
  totalSamples: number;

  // Metrics
  identifiersProcessed: number;
  identifiersRenamed: number;
  tokensUsed: number;

  // Timing
  durationMs: number;

  // Overall progress percentage
  progress: number;

  // Error message if failed
  errorMessage?: string;

  // Output path when completed
  outputPath?: string;
}

/**
 * Initial progress state
 */
const initialState: ProgressState = {
  status: "idle",
  currentPass: 0,
  totalPasses: 2,
  currentBatch: 0,
  totalBatches: 0,
  completedSamples: 0,
  totalSamples: 0,
  identifiersProcessed: 0,
  identifiersRenamed: 0,
  tokensUsed: 0,
  durationMs: 0,
  progress: 0,
};

/**
 * Options for the hook
 */
export interface UseExperimentProgressOptions {
  /** Specific sample to watch (optional, watches first sample by default) */
  sample?: SampleName;

  /** Callback when progress updates */
  onProgress?: (progress: ProgressState) => void;

  /** Callback when completed */
  onComplete?: (progress: ProgressState) => void;

  /** Callback when failed */
  onError?: (error: string) => void;

  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
}

/**
 * Hook to subscribe to experiment progress via SSE
 *
 * @param experimentId Experiment ID to watch (null to not watch)
 * @param options Hook options
 * @returns Progress state and control functions
 */
export function useExperimentProgress(
  experimentId: string | null,
  options: UseExperimentProgressOptions = {}
): {
  progress: ProgressState;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
} {
  const {
    sample,
    onProgress,
    onComplete,
    onError,
    autoReconnect = true,
  } = options;

  const [progress, setProgress] = useState<ProgressState>(initialState);
  const [isConnected, setIsConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Connect to SSE endpoint
   */
  const connect = useCallback(() => {
    if (!experimentId) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Build URL
    let url = `/api/experiments/${experimentId}/progress`;
    if (sample) {
      url += `?sample=${encodeURIComponent(sample)}`;
    }

    setProgress((prev) => ({ ...prev, status: "connecting" }));

    // Create EventSource
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleProgressEvent(data);
      } catch (error) {
        console.error("[useExperimentProgress] Failed to parse event:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[useExperimentProgress] SSE error:", error);
      setIsConnected(false);

      // Close the connection
      eventSource.close();
      eventSourceRef.current = null;

      // Auto-reconnect after delay
      if (autoReconnect && progress.status === "running") {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      }
    };
  }, [experimentId, sample, autoReconnect, progress.status]);

  /**
   * Disconnect from SSE endpoint
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  }, []);

  /**
   * Handle incoming progress event
   */
  const handleProgressEvent = useCallback(
    (data: any) => {
      setProgress((prev) => {
        let newState = { ...prev };

        switch (data.type) {
          case "connected":
            newState.status = "running";
            break;

          case "idle":
            newState.status = "idle";
            break;

          case "waiting":
            newState.status = "connecting";
            break;

          case "pass_started":
            newState.status = "running";
            newState.currentPass = data.passNumber || 1;
            newState.totalPasses = data.totalPasses || prev.totalPasses;
            newState.passProcessor = data.passProcessor;
            newState.currentBatch = 0;
            newState.totalBatches = 0;  // Reset batch count for new pass
            break;

          case "batch_completed":
            newState.currentBatch = (data.batchNumber || 0) + 1;
            newState.totalBatches = data.totalBatches || prev.totalBatches;
            // Use cumulative values from server directly (don't accumulate)
            newState.identifiersProcessed = data.identifiersProcessed || 0;
            newState.identifiersRenamed = data.identifiersRenamed || 0;
            newState.tokensUsed = data.tokensUsed || 0;
            newState.durationMs = data.durationMs || 0;

            // Calculate progress
            if (newState.totalPasses > 0 && newState.totalBatches > 0) {
              const passProgress = ((newState.currentPass - 1) / newState.totalPasses) * 100;
              const batchProgress = (newState.currentBatch / newState.totalBatches) * (100 / newState.totalPasses);
              newState.progress = Math.round(passProgress + batchProgress);
            }
            break;

          case "pass_completed":
            newState.currentPass = data.passNumber || prev.currentPass;
            newState.progress = Math.round((newState.currentPass / newState.totalPasses) * 100);
            break;

          case "completed":
            newState.status = "completed";
            newState.progress = 100;
            newState.outputPath = data.outputPath;
            newState.durationMs = data.durationMs || prev.durationMs;

            // Disconnect on completion
            disconnect();

            // Call completion callback
            onComplete?.(newState);
            break;

          case "failed":
            newState.status = "failed";
            newState.errorMessage = data.errorMessage;

            // Disconnect on failure
            disconnect();

            // Call error callback
            onError?.(data.errorMessage || "Unknown error");
            break;

          case "error":
            newState.errorMessage = data.errorMessage;
            onError?.(data.errorMessage || "Unknown error");
            break;
        }

        // Update sample info if provided
        if (data.sample) {
          newState.currentSample = data.sample;
        }

        // Call progress callback
        onProgress?.(newState);

        return newState;
      });
    },
    [disconnect, onProgress, onComplete, onError]
  );

  // Connect when experimentId changes
  useEffect(() => {
    if (experimentId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [experimentId, connect, disconnect]);

  // Reset state when experimentId changes
  useEffect(() => {
    if (!experimentId) {
      setProgress(initialState);
    }
  }, [experimentId]);

  return {
    progress,
    isConnected,
    connect,
    disconnect,
  };
}

/**
 * Format progress for display
 */
export function formatProgress(progress: ProgressState): string {
  if (progress.status === "idle") {
    return "Idle";
  }

  if (progress.status === "connecting") {
    return "Connecting...";
  }

  if (progress.status === "completed") {
    return `Completed in ${(progress.durationMs / 1000).toFixed(1)}s`;
  }

  if (progress.status === "failed") {
    return `Failed: ${progress.errorMessage || "Unknown error"}`;
  }

  // Running
  const pass = `Pass ${progress.currentPass}/${progress.totalPasses}`;
  const batch = progress.totalBatches > 0
    ? ` (Batch ${progress.currentBatch}/${progress.totalBatches})`
    : "";

  return `${pass}${batch} - ${progress.progress}%`;
}

/**
 * Format tokens for display
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}
