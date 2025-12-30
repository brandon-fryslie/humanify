/**
 * TURBO V2 PRESETS
 *
 * Pre-configured pipeline strategies for common use cases
 */

import { PassConfig } from "../ledger/events.js";

/**
 * Preset definitions
 */
export const PRESETS: Record<string, PassConfig[]> = {
  /**
   * FAST: Maximum speed, good quality
   * 2-pass parallel with same settings
   * Pass 2 sees all Pass 1 renames for better context
   */
  fast: [
    { processor: "rename", mode: "parallel", concurrency: 50 },
    { processor: "rename", mode: "parallel", concurrency: 50 },
  ],

  /**
   * BALANCED: Good quality/speed trade-off
   * Initial rename + refinement pass
   * Refinement confirms or improves existing names
   */
  balanced: [
    { processor: "rename", mode: "parallel", concurrency: 50 },
    { processor: "refine", mode: "parallel", concurrency: 50 },
  ],

  /**
   * QUALITY: Maximum quality, 5 passes
   * Multiple refinement rounds with conflict detection
   * Highest cost but best results
   */
  quality: [
    { processor: "rename", mode: "parallel", concurrency: 50 },
    { processor: "refine", mode: "parallel", concurrency: 50 },
    { processor: "analyze", mode: "parallel", concurrency: 100 }, // Conflict detection
    { processor: "rename", mode: "sequential", concurrency: 1, filter: "low-confidence" },
    { processor: "transform", mode: "parallel", concurrency: 100 }, // Consistency enforcement
  ],

  /**
   * ANCHOR: Anchor-first hybrid strategy
   * Sequential processing of important identifiers first
   * Then parallel processing of rest with anchor context
   */
  anchor: [
    { processor: "analyze", mode: "parallel", concurrency: 100 }, // Detect anchors
    { processor: "rename", mode: "sequential", concurrency: 1, filter: "anchors" },
    { processor: "rename", mode: "parallel", concurrency: 50 }, // Rest with glossary
    { processor: "refine", mode: "parallel", concurrency: 50 }, // Optional cleanup
  ],
};

/**
 * Get preset configuration by name
 *
 * @param name - Preset name (fast, balanced, quality, anchor)
 * @returns PassConfig array or undefined if preset doesn't exist
 */
export function getPreset(name: string): PassConfig[] | undefined {
  return PRESETS[name.toLowerCase()];
}

/**
 * List all available presets with descriptions
 */
export function listPresets(): Array<{ name: string; description: string; passes: number }> {
  return [
    {
      name: "fast",
      description: "Maximum speed - 2-pass parallel (default)",
      passes: 2,
    },
    {
      name: "balanced",
      description: "Good quality/speed - rename + refine",
      passes: 2,
    },
    {
      name: "quality",
      description: "Maximum quality - 5 passes with conflict detection",
      passes: 5,
    },
    {
      name: "anchor",
      description: "Anchor-first hybrid - sequential anchors then parallel bulk",
      passes: 4,
    },
  ];
}

/**
 * Validate preset name
 */
export function isValidPreset(name: string): boolean {
  return name.toLowerCase() in PRESETS;
}

/**
 * Get helpful preset descriptions for CLI help
 */
export function getPresetHelp(): string {
  const presets = listPresets();
  const lines = presets.map(
    (p) => `  ${p.name.padEnd(12)} ${p.description} (${p.passes} passes)`
  );

  return `
Available Presets:
${lines.join("\n")}

Use: --preset <name>
`.trim();
}
