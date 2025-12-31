/**
 * TRANSFORMER: AST Rename Applicator
 *
 * Purpose: Apply rename map to AST and emit transformed code with validation
 *
 * Key Responsibilities:
 * - Parse code to AST via Babel
 * - Apply rename map using scope.rename() for safe renaming
 * - Handle naming collisions (prefix with underscore)
 * - Validate: renamed_in_code == len(rename_map)
 * - Emit snapshots to disk with atomic writes
 */

import { parseAsync, transformFromAstAsync } from "@babel/core";
import * as babelTraverse from "@babel/traverse";
import * as babelGenerator from "@babel/generator";
import { createHash } from "crypto";
import { writeFileSync, renameSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";

// Handle Babel's CommonJS/ESM export quirks
const traverse: typeof babelTraverse.default.default = (
  typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : babelTraverse.default.default
) as any;

const generate: typeof babelGenerator.default = (
  typeof babelGenerator.default === "function"
    ? babelGenerator.default
    : (babelGenerator as any).default?.default || babelGenerator
) as any;

/**
 * Rename map: identifier ID -> new name
 */
export type RenameMap = Record<string, string>;

/**
 * Transform result with validation metrics
 */
export interface TransformResult {
  code: string;
  applied: number; // Number of renames applied
  skipped: number; // Number of renames skipped (not found)
  collisions: number; // Number of collision-based prefixes added
  snapshotPath?: string;
  snapshotHash?: string;
}

/**
 * Transformer configuration
 */
export interface TransformerConfig {
  validateOutput?: boolean; // Parse output to ensure valid JavaScript (default: true)
  emitSnapshot?: boolean; // Write snapshot to disk (default: false)
  snapshotPath?: string; // Path for snapshot file
}

/**
 * Transformer: Apply renames to AST and emit transformed code
 */
export class Transformer {
  private config: Required<TransformerConfig>;

  constructor(config: TransformerConfig = {}) {
    this.config = {
      validateOutput: config.validateOutput ?? true,
      emitSnapshot: config.emitSnapshot ?? false,
      snapshotPath: config.snapshotPath ?? "",
    };
  }

  /**
   * Transform code by applying rename map
   *
   * This is the core transformation function:
   * 1. Parse code to AST
   * 2. Build mapping of identifier locations to new names
   * 3. Traverse AST and apply renames via scope.rename()
   * 4. Handle collisions by prefixing with _
   * 5. Generate code from transformed AST
   * 6. Validate output (if enabled)
   * 7. Emit snapshot (if enabled)
   *
   * @param code Original code
   * @param renameMap Map of identifier IDs to new names
   * @param identifierLocations Map of identifier IDs to their names (for lookup)
   * @returns Transform result with metrics
   */
  async transform(
    code: string,
    renameMap: RenameMap,
    identifierLocations: Map<string, string> // id -> original name
  ): Promise<TransformResult> {
    // Parse code to AST
    const ast = await parseAsync(code, {
      sourceType: "unambiguous",
      
    });

    if (!ast) {
      throw new Error("Failed to parse code to AST");
    }

    // Track rename application
    const applied = new Set<string>();
    const skipped = new Set<string>();
    const collisions = new Set<string>();

    // Build reverse mapping: original name -> list of (id, newName)
    const nameToRenames = new Map<string, Array<{ id: string; newName: string }>>();
    for (const [id, newName] of Object.entries(renameMap)) {
      const originalName = identifierLocations.get(id);
      if (!originalName) {
        skipped.add(id);
        continue;
      }

      if (!nameToRenames.has(originalName)) {
        nameToRenames.set(originalName, []);
      }
      nameToRenames.get(originalName)!.push({ id, newName });
    }

    // Pre-compute final names per scope to detect inter-rename collisions
    // Then apply all renames in a second pass
    const scopeRenames = new Map<any, Array<{ originalName: string; finalName: string; id: string }>>();

    // Track global/module-level names that have been used
    // This prevents two different module-level bindings from getting the same name
    const globalUsedNames = new Set<string>();

    // Get the program scope for reference
    let programScope: any = null;
    traverse(ast, {
      Program(path) {
        programScope = path.scope;
        // Collect all existing module-level bindings that won't be renamed
        for (const [name] of Object.entries(path.scope.bindings)) {
          if (!nameToRenames.has(name)) {
            globalUsedNames.add(name);
          }
        }
        path.stop();
      },
    });

    // Track which IDs we've already processed (to avoid duplicates from nested scopes)
    const processedIds = new Set<string>();

    // First pass: compute final names and detect collisions
    // Only process each binding once (at its "home" scope, typically Program for module-level)
    traverse(ast, {
      Scope(path) {
        const scope = path.scope;
        const bindings = scope.bindings;

        // Track names we're going to use in this scope
        const usedNames = new Set<string>();

        // Also track existing bindings that WON'T be renamed
        for (const [name] of Object.entries(bindings)) {
          if (!nameToRenames.has(name)) {
            usedNames.add(name);
          }
        }

        const renames: Array<{ originalName: string; finalName: string; id: string }> = [];

        for (const [name, binding] of Object.entries(bindings)) {
          const renameList = nameToRenames.get(name);
          if (!renameList || renameList.length === 0) {
            continue;
          }

          const { id, newName } = renameList[0];

          // Skip if we've already processed this ID
          if (processedIds.has(id)) {
            continue;
          }

          // Check if this binding is at the program (module) level
          // This handles classes, functions, variables declared at the top level
          const isGlobalBinding = programScope && programScope.bindings[name] === binding;

          // Compute final name, avoiding collisions
          let finalName = newName;

          // Check against:
          // 1. Names used in this scope
          // 2. Existing bindings in scope hierarchy
          // 3. Global names (for module-level bindings)
          const hasLocalCollision = usedNames.has(finalName) || scope.hasBinding(finalName);
          const hasGlobalCollision = isGlobalBinding && globalUsedNames.has(finalName);

          if (hasLocalCollision || hasGlobalCollision) {
            let attempt = 1;
            let candidateName = `_${finalName}`;
            while (
              usedNames.has(candidateName) ||
              scope.hasBinding(candidateName) ||
              (isGlobalBinding && globalUsedNames.has(candidateName))
            ) {
              attempt++;
              candidateName = `_`.repeat(attempt) + newName;
              if (attempt > 10) {
                console.warn(`[transformer] Too many collisions for ${name} -> ${newName}, skipping`);
                skipped.add(id);
                continue;
              }
            }
            finalName = candidateName;
            collisions.add(id);
          }

          // Mark as processed
          processedIds.add(id);

          // Reserve this name
          usedNames.add(finalName);
          if (isGlobalBinding) {
            globalUsedNames.add(finalName);
          }
          renames.push({ originalName: name, finalName, id });
        }

        if (renames.length > 0) {
          scopeRenames.set(scope, renames);
        }
      },
    });

    // Second pass: apply the computed renames
    for (const [scope, renames] of scopeRenames) {
      for (const { originalName, finalName, id } of renames) {
        try {
          scope.rename(originalName, finalName);
          applied.add(id);
        } catch (error) {
          console.warn(`[transformer] Failed to rename ${originalName} -> ${finalName}:`, error);
          skipped.add(id);
        }
      }
    }

    // Generate code from transformed AST
    const output = generate(ast, {
      retainLines: false,
      compact: false,
      comments: false,
    });

    const transformedCode = output.code;

    // Validate output if enabled
    if (this.config.validateOutput) {
      await this.validateCode(transformedCode);
    }

    // Validation: Check that applied count matches expected
    const expectedApplied = Object.keys(renameMap).length;
    const actualApplied = applied.size;

    if (actualApplied !== expectedApplied) {
      const diff = expectedApplied - actualApplied;
      console.warn(
        `[transformer] Warning: Expected to apply ${expectedApplied} renames, actually applied ${actualApplied} (${diff} skipped)`
      );
    }

    // Emit snapshot if enabled
    let snapshotPath: string | undefined;
    let snapshotHash: string | undefined;

    if (this.config.emitSnapshot && this.config.snapshotPath) {
      const result = await this.emitSnapshot(transformedCode, this.config.snapshotPath);
      snapshotPath = result.path;
      snapshotHash = result.hash;
    }

    return {
      code: transformedCode,
      applied: applied.size,
      skipped: skipped.size,
      collisions: collisions.size,
      snapshotPath,
      snapshotHash,
    };
  }

  /**
   * Validate that code is syntactically valid JavaScript
   * Throws if parsing fails
   */
  private async validateCode(code: string): Promise<void> {
    try {
      await parseAsync(code, {
        sourceType: "unambiguous",
        
      });
    } catch (error) {
      throw new Error(`Transformed code is not valid JavaScript: ${error}`);
    }
  }

  /**
   * Emit snapshot to disk with atomic write
   *
   * Uses temp file + rename pattern for crash safety
   *
   * @param code Code to write
   * @param path Target path
   * @returns Snapshot metadata
   */
  private async emitSnapshot(
    code: string,
    path: string
  ): Promise<{ path: string; hash: string }> {
    // Ensure directory exists
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const tempPath = `${path}.tmp`;

    try {
      // Compute hash for integrity verification
      const hash = createHash("sha256").update(code).digest("hex");

      // Write to temp file
      writeFileSync(tempPath, code, "utf-8");

      // Atomic rename
      renameSync(tempPath, path);

      return { path, hash };
    } catch (error) {
      // Cleanup temp file on error
      if (existsSync(tempPath)) {
        try {
          unlinkSync(tempPath);
        } catch {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
  }

  /**
   * Create a transformer with snapshot emission enabled
   *
   * Helper factory for common use case
   */
  static withSnapshot(snapshotPath: string): Transformer {
    return new Transformer({
      validateOutput: true,
      emitSnapshot: true,
      snapshotPath,
    });
  }
}
