/**
 * Snapshot Manager
 *
 * Manages atomic snapshot writes with validation.
 *
 * Features:
 * - Atomic writes via temp file + rename
 * - Validation: parse output to ensure valid JavaScript
 * - Hash computation for integrity checking
 * - Diff verification: changes match expected rename count
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { parse } from '@babel/parser';

export interface SnapshotMetadata {
  passNumber: number;
  hash: string;
  size: number;
  timestamp: string;
  renameCount: number;
}

export interface DiffVerificationResult {
  expectedChanges: number;
  actualChanges: number;
  match: boolean;
  details?: string;
}

export interface SnapshotManagerInterface {
  /**
   * Save snapshot atomically with validation
   */
  saveSnapshot(
    passNumber: number,
    content: string,
    renameCount: number
  ): Promise<SnapshotMetadata>;

  /**
   * Load snapshot
   */
  loadSnapshot(passNumber: number): Promise<string | null>;

  /**
   * Get snapshot metadata
   */
  getMetadata(passNumber: number): Promise<SnapshotMetadata | null>;

  /**
   * Verify snapshot is valid JavaScript
   */
  validateSnapshot(content: string): Promise<boolean>;

  /**
   * Verify diff between two snapshots
   */
  verifyDiff(
    beforeContent: string,
    afterContent: string,
    expectedRenames: number
  ): Promise<DiffVerificationResult>;

  /**
   * Compute hash for snapshot
   */
  computeHash(content: string): string;

  /**
   * Get path to snapshot file
   */
  getSnapshotPath(passNumber: number): string;
}

export class SnapshotManager implements SnapshotManagerInterface {
  private jobDir: string;

  constructor(jobDir: string) {
    this.jobDir = jobDir;
  }

  /**
   * Save snapshot atomically with validation
   */
  async saveSnapshot(
    passNumber: number,
    content: string,
    renameCount: number
  ): Promise<SnapshotMetadata> {
    // Validate before saving
    const isValid = await this.validateSnapshot(content);
    if (!isValid) {
      throw new Error('Snapshot validation failed: not valid JavaScript');
    }

    const snapshotPath = this.getSnapshotPath(passNumber);
    const tempPath = `${snapshotPath}.tmp`;

    // Ensure snapshots directory exists
    const snapshotsDir = path.dirname(snapshotPath);
    await fs.mkdir(snapshotsDir, { recursive: true });

    // Write to temp file
    await fs.writeFile(tempPath, content, 'utf-8');

    // Atomic rename
    await fs.rename(tempPath, snapshotPath);

    // Compute metadata
    const hash = this.computeHash(content);
    const size = Buffer.byteLength(content, 'utf-8');
    const timestamp = new Date().toISOString();

    const metadata: SnapshotMetadata = {
      passNumber,
      hash,
      size,
      timestamp,
      renameCount,
    };

    // Save metadata
    await this.saveMetadata(metadata);

    return metadata;
  }

  /**
   * Load snapshot
   */
  async loadSnapshot(passNumber: number): Promise<string | null> {
    const snapshotPath = this.getSnapshotPath(passNumber);

    try {
      const content = await fs.readFile(snapshotPath, 'utf-8');
      return content;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null; // Snapshot doesn't exist
      }
      throw error;
    }
  }

  /**
   * Get snapshot metadata
   */
  async getMetadata(passNumber: number): Promise<SnapshotMetadata | null> {
    const metadataPath = this.getMetadataPath(passNumber);

    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content) as SnapshotMetadata;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null; // Metadata doesn't exist
      }
      throw error;
    }
  }

  /**
   * Verify snapshot is valid JavaScript
   */
  async validateSnapshot(content: string): Promise<boolean> {
    try {
      // Try to parse as JavaScript
      parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        errorRecovery: false,
      });
      return true;
    } catch (error) {
      // Parse failed - invalid JavaScript
      return false;
    }
  }

  /**
   * Verify diff between two snapshots
   *
   * This is a simple implementation that counts the number of differences.
   * A more sophisticated implementation could use a proper diff algorithm.
   */
  async verifyDiff(
    beforeContent: string,
    afterContent: string,
    expectedRenames: number
  ): Promise<DiffVerificationResult> {
    // Simple heuristic: count lines that differ
    const beforeLines = beforeContent.split('\n');
    const afterLines = afterContent.split('\n');

    let actualChanges = 0;

    // Count differing lines (rough approximation)
    const maxLines = Math.max(beforeLines.length, afterLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (beforeLines[i] !== afterLines[i]) {
        actualChanges++;
      }
    }

    // Each rename typically affects multiple lines (definition + references)
    // So we expect more line changes than renames
    // Use a lenient threshold: actualChanges should be at least expectedRenames
    const match = actualChanges >= expectedRenames;

    return {
      expectedChanges: expectedRenames,
      actualChanges,
      match,
      details: match
        ? undefined
        : `Expected at least ${expectedRenames} changes, found ${actualChanges}`,
    };
  }

  /**
   * Compute hash for snapshot
   */
  computeHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get path to snapshot file
   */
  getSnapshotPath(passNumber: number): string {
    const filename = `after-pass-${String(passNumber).padStart(3, '0')}.js`;
    return path.join(this.jobDir, 'snapshots', filename);
  }

  /**
   * Get path to metadata file
   */
  private getMetadataPath(passNumber: number): string {
    const filename = `after-pass-${String(passNumber).padStart(3, '0')}.json`;
    return path.join(this.jobDir, 'snapshots', filename);
  }

  /**
   * Save metadata
   */
  private async saveMetadata(metadata: SnapshotMetadata): Promise<void> {
    const metadataPath = this.getMetadataPath(metadata.passNumber);
    const tempPath = `${metadataPath}.tmp`;

    const content = JSON.stringify(metadata, null, 2);
    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, metadataPath);
  }

  /**
   * Verify snapshot hash matches expected
   */
  async verifyHash(passNumber: number, expectedHash: string): Promise<boolean> {
    const content = await this.loadSnapshot(passNumber);
    if (content === null) {
      return false;
    }

    const actualHash = this.computeHash(content);
    return actualHash === expectedHash;
  }

  /**
   * List all available snapshots
   */
  async listSnapshots(): Promise<number[]> {
    const snapshotsDir = path.join(this.jobDir, 'snapshots');

    try {
      const files = await fs.readdir(snapshotsDir);
      const passNumbers: number[] = [];

      for (const file of files) {
        const match = file.match(/^after-pass-(\d+)\.js$/);
        if (match) {
          passNumbers.push(parseInt(match[1], 10));
        }
      }

      return passNumbers.sort((a, b) => a - b);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []; // Directory doesn't exist
      }
      throw error;
    }
  }
}
