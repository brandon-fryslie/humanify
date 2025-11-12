/**
 * Lightweight instrumentation system for performance measurement.
 *
 * Design goals:
 * - Minimal overhead when disabled
 * - Hierarchical span tracking (parent-child relationships)
 * - Memory usage tracking
 * - Structured JSON export for analysis
 * - No external dependencies
 */

import { performance } from "perf_hooks";

export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
}

export interface SpanData {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: SpanAttributes;
  children: SpanData[];
  memoryStart?: NodeJS.MemoryUsage;
  memoryEnd?: NodeJS.MemoryUsage;
  memoryDelta?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

export interface ISpan {
  setAttribute(key: string, value: string | number | boolean): void;
  setAttributes(attributes: SpanAttributes): void;
  end(): void;
  getData(): SpanData;
  getParent(): ISpan | null;
}

export class Span implements ISpan {
  private data: SpanData;
  private parent: Span | null;
  private instrumentation: Instrumentation;

  constructor(
    name: string,
    instrumentation: Instrumentation,
    parent: Span | null,
    attributes: SpanAttributes = {}
  ) {
    this.instrumentation = instrumentation;
    this.parent = parent;
    this.data = {
      name,
      startTime: performance.now(),
      attributes: { ...attributes },
      children: []
    };

    // Always track memory when instrumentation is enabled
    this.data.memoryStart = process.memoryUsage();
  }

  /**
   * Set an attribute on this span
   */
  setAttribute(key: string, value: string | number | boolean): void {
    this.data.attributes[key] = value;
  }

  /**
   * Set multiple attributes at once
   */
  setAttributes(attributes: SpanAttributes): void {
    Object.assign(this.data.attributes, attributes);
  }

  /**
   * End this span and record its duration
   */
  end(): void {
    this.data.endTime = performance.now();
    this.data.duration = this.data.endTime - this.data.startTime;

    // Always calculate memory delta when instrumentation is enabled
    if (this.data.memoryStart) {
      this.data.memoryEnd = process.memoryUsage();
      this.data.memoryDelta = {
        heapUsed: this.data.memoryEnd.heapUsed - this.data.memoryStart.heapUsed,
        heapTotal: this.data.memoryEnd.heapTotal - this.data.memoryStart.heapTotal,
        external: this.data.memoryEnd.external - this.data.memoryStart.external
      };
    }

    // Live instrumentation output
    this.instrumentation.onSpanEnd(this);

    this.instrumentation.endSpan(this);
  }

  /**
   * Get the raw span data
   */
  getData(): SpanData {
    return this.data;
  }

  /**
   * Get the parent span
   */
  getParent(): Span | null {
    return this.parent;
  }
}

export class Instrumentation {
  private enabled: boolean = false;
  private currentSpan: Span | null = null;
  private rootSpans: SpanData[] = [];

  /**
   * Check if instrumentation is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable or disable instrumentation
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Start a new span
   */
  startSpan(name: string, attributes: SpanAttributes = {}): ISpan {
    if (!this.isEnabled()) {
      // Return a no-op span that does nothing
      return new NoOpSpan();
    }

    const span = new Span(name, this, this.currentSpan, attributes);

    // Add to parent's children or root spans
    if (this.currentSpan) {
      this.currentSpan.getData().children.push(span.getData());
    } else {
      this.rootSpans.push(span.getData());
    }

    this.currentSpan = span;
    return span;
  }

  /**
   * Called when a span ends (for live instrumentation output)
   */
  onSpanEnd(span: Span): void {
    if (!this.enabled) return;

    const data = span.getData();
    const depth = this.getSpanDepth(span);
    const indent = "  ".repeat(depth);
    const duration = data.duration ? formatMs(data.duration) : "?";

    let line = `${indent}✓ ${data.name}: ${duration}`;

    // Add attributes if present
    const attrs = Object.entries(data.attributes)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");

    if (attrs) {
      line += ` [${attrs}]`;
    }

    // Add memory delta if tracked
    if (data.memoryDelta) {
      const heapMB = (data.memoryDelta.heapUsed / 1024 / 1024).toFixed(2);
      line += ` (heap: ${heapMB > 0 ? "+" : ""}${heapMB}MB)`;
    }

    console.log(line);
  }

  /**
   * Get the depth of a span in the hierarchy
   */
  private getSpanDepth(span: Span): number {
    let depth = 0;
    let current = span.getParent();
    while (current) {
      depth++;
      current = current.getParent();
    }
    return depth;
  }

  /**
   * End a span and restore parent context
   */
  endSpan(span: Span): void {
    if (this.currentSpan === span) {
      this.currentSpan = span.getParent();
    }
  }

  /**
   * Measure an async operation
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    attributes?: SpanAttributes
  ): Promise<T> {
    const span = this.startSpan(name, attributes);
    try {
      const result = await fn();
      return result;
    } finally {
      span.end();
    }
  }

  /**
   * Measure a sync operation
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    attributes?: SpanAttributes
  ): T {
    const span = this.startSpan(name, attributes);
    try {
      return fn();
    } finally {
      span.end();
    }
  }

  /**
   * Get summary statistics
   */
  getSummary(): SummaryStats[] {
    const summary: Map<string, SummaryStats> = new Map();
    const visited = new Set<SpanData>();

    const collectStats = (spans: SpanData[], depth: number) => {
      for (const span of spans) {
        // Prevent circular reference issues
        if (visited.has(span)) continue;
        visited.add(span);

        if (!span.duration) continue;

        const existing = summary.get(span.name);
        if (existing) {
          existing.count++;
          existing.totalDuration += span.duration;
          existing.minDuration = Math.min(existing.minDuration, span.duration);
          existing.maxDuration = Math.max(existing.maxDuration, span.duration);
        } else {
          summary.set(span.name, {
            name: span.name,
            count: 1,
            totalDuration: span.duration,
            minDuration: span.duration,
            maxDuration: span.duration,
            avgDuration: 0
          });
        }

        if (span.children && span.children.length > 0) {
          collectStats(span.children, depth + 1);
        }
      }
    };

    collectStats(this.rootSpans, 0);

    // Calculate averages
    for (const stats of summary.values()) {
      stats.avgDuration = stats.totalDuration / stats.count;
    }

    return Array.from(summary.values()).sort(
      (a, b) => b.totalDuration - a.totalDuration
    );
  }

  /**
   * Print summary to console
   */
  printSummary(): void {
    if (!this.enabled) return;

    const summary = this.getSummary();
    if (summary.length === 0) return;

    console.log("\n=== Performance Summary ===");
    console.log(
      `${"Operation".padEnd(40)} ${"Count".padStart(6)} ${"Total".padStart(10)} ${"Avg".padStart(10)} ${"Min".padStart(10)} ${"Max".padStart(10)}`
    );
    console.log("─".repeat(96));

    for (const stats of summary) {
      console.log(
        `${stats.name.padEnd(40)} ` +
        `${stats.count.toString().padStart(6)} ` +
        `${formatMs(stats.totalDuration).padStart(10)} ` +
        `${formatMs(stats.avgDuration).padStart(10)} ` +
        `${formatMs(stats.minDuration).padStart(10)} ` +
        `${formatMs(stats.maxDuration).padStart(10)}`
      );
    }
    console.log();
  }

  /**
   * Export all span data as JSON
   */
  exportJSON(): string {
    return JSON.stringify(
      {
        enabled: this.enabled,
        timestamp: new Date().toISOString(),
        spans: this.rootSpans
      },
      null,
      2
    );
  }

  /**
   * Reset all collected data
   */
  reset(): void {
    this.rootSpans = [];
    this.currentSpan = null;
  }
}

/**
 * No-op span for when instrumentation is disabled
 */
class NoOpSpan implements ISpan {
  setAttribute(): void {
    // no-op
  }

  setAttributes(): void {
    // no-op
  }

  end(): void {
    // no-op
  }

  getData(): SpanData {
    return {
      name: "noop",
      startTime: 0,
      attributes: {},
      children: []
    };
  }

  getParent(): null {
    return null;
  }
}

export interface SummaryStats {
  name: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
}

function formatMs(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(0)}μs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

// Global instrumentation instance
export const instrumentation = new Instrumentation();
