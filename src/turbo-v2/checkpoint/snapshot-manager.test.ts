/**
 * Unit tests for SnapshotManager
 *
 * Tests:
 * - Atomic writes (temp + rename)
 * - Validation of JavaScript syntax
 * - Hash computation and verification
 * - Diff verification
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs/promises';
import { SnapshotManager } from './snapshot-manager.js';

const TEST_JOB_DIR = '.test-snapshots';

describe('SnapshotManager', () => {
  let manager: SnapshotManager;

  beforeEach(async () => {
    // Clean up test directory
    await fs.rm(TEST_JOB_DIR, { recursive: true, force: true });

    manager = new SnapshotManager(TEST_JOB_DIR);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(TEST_JOB_DIR, { recursive: true, force: true });
  });

  describe('saveSnapshot and loadSnapshot', () => {
    it('should save and load snapshot correctly', async () => {
      const code = 'function foo() { return 42; }';
      const metadata = await manager.saveSnapshot(1, code, 1);

      assert.equal(metadata.passNumber, 1);
      assert.equal(metadata.renameCount, 1);
      assert.equal(typeof metadata.hash, 'string');
      assert.equal(typeof metadata.timestamp, 'string');

      const loaded = await manager.loadSnapshot(1);
      assert.equal(loaded, code);
    });

    it('should return null for non-existent snapshot', async () => {
      const loaded = await manager.loadSnapshot(999);
      assert.equal(loaded, null);
    });

    it('should handle multiple snapshots', async () => {
      const code1 = 'function foo() { return 42; }';
      const code2 = 'function bar() { return 43; }';

      await manager.saveSnapshot(1, code1, 1);
      await manager.saveSnapshot(2, code2, 1);

      const loaded1 = await manager.loadSnapshot(1);
      const loaded2 = await manager.loadSnapshot(2);

      assert.equal(loaded1, code1);
      assert.equal(loaded2, code2);
    });
  });

  describe('validateSnapshot', () => {
    it('should validate correct JavaScript', async () => {
      const validCode = 'function foo() { return 42; }';
      const isValid = await manager.validateSnapshot(validCode);
      assert.equal(isValid, true);
    });

    it('should validate ES6+ syntax', async () => {
      const es6Code = `
        const arr = [1, 2, 3];
        const doubled = arr.map(x => x * 2);
        export default doubled;
      `;
      const isValid = await manager.validateSnapshot(es6Code);
      assert.equal(isValid, true);
    });

    it('should reject invalid JavaScript', async () => {
      const invalidCode = 'function foo() { return 42';
      const isValid = await manager.validateSnapshot(invalidCode);
      assert.equal(isValid, false);
    });

    it('should accept empty string as valid (empty program)', async () => {
      // Empty string is technically valid JavaScript (empty program)
      const isValid = await manager.validateSnapshot('');
      assert.equal(isValid, true);
    });
  });

  describe('getMetadata', () => {
    it('should save and retrieve metadata', async () => {
      const code = 'function foo() { return 42; }';
      const savedMetadata = await manager.saveSnapshot(1, code, 5);

      const retrievedMetadata = await manager.getMetadata(1);
      assert.notEqual(retrievedMetadata, null);
      assert.deepEqual(retrievedMetadata, savedMetadata);
    });

    it('should return null for non-existent metadata', async () => {
      const metadata = await manager.getMetadata(999);
      assert.equal(metadata, null);
    });
  });

  describe('computeHash', () => {
    it('should compute consistent hash', () => {
      const code = 'function foo() { return 42; }';
      const hash1 = manager.computeHash(code);
      const hash2 = manager.computeHash(code);

      assert.equal(hash1, hash2);
      assert.equal(hash1.length, 64); // SHA-256 produces 64 hex characters
    });

    it('should produce different hash for different content', () => {
      const code1 = 'function foo() { return 42; }';
      const code2 = 'function bar() { return 43; }';

      const hash1 = manager.computeHash(code1);
      const hash2 = manager.computeHash(code2);

      assert.notEqual(hash1, hash2);
    });

    it('should be sensitive to whitespace changes', () => {
      const code1 = 'function foo() { return 42; }';
      const code2 = 'function foo() {return 42;}';

      const hash1 = manager.computeHash(code1);
      const hash2 = manager.computeHash(code2);

      assert.notEqual(hash1, hash2);
    });
  });

  describe('verifyHash', () => {
    it('should verify correct hash', async () => {
      const code = 'function foo() { return 42; }';
      const metadata = await manager.saveSnapshot(1, code, 1);

      const isValid = await manager.verifyHash(1, metadata.hash);
      assert.equal(isValid, true);
    });

    it('should reject incorrect hash', async () => {
      const code = 'function foo() { return 42; }';
      await manager.saveSnapshot(1, code, 1);

      const isValid = await manager.verifyHash(1, 'wrong-hash');
      assert.equal(isValid, false);
    });

    it('should return false for non-existent snapshot', async () => {
      const isValid = await manager.verifyHash(999, 'any-hash');
      assert.equal(isValid, false);
    });
  });

  describe('verifyDiff', () => {
    it('should verify simple rename', async () => {
      const before = 'function a() { return 42; }';
      const after = 'function foo() { return 42; }';

      const result = await manager.verifyDiff(before, after, 1);
      assert.equal(result.match, true);
      assert.equal(result.expectedChanges, 1);
      assert.ok(result.actualChanges >= 1);
    });

    it('should verify multiple renames', async () => {
      const before = `
        function a() { return b(); }
        function b() { return c(); }
        function c() { return 42; }
      `;
      const after = `
        function foo() { return bar(); }
        function bar() { return baz(); }
        function baz() { return 42; }
      `;

      const result = await manager.verifyDiff(before, after, 3);
      assert.equal(result.match, true);
      assert.equal(result.expectedChanges, 3);
      assert.ok(result.actualChanges >= 3);
    });

    it('should detect no changes', async () => {
      const code = 'function foo() { return 42; }';

      const result = await manager.verifyDiff(code, code, 0);
      assert.equal(result.match, true);
      assert.equal(result.expectedChanges, 0);
      assert.equal(result.actualChanges, 0);
    });

    it('should detect insufficient changes', async () => {
      const before = 'function a() { return 42; }';
      const after = 'function a() { return 42; }'; // No actual change

      const result = await manager.verifyDiff(before, after, 5);
      assert.equal(result.match, false);
      assert.equal(result.expectedChanges, 5);
      assert.equal(result.actualChanges, 0);
      assert.ok(result.details?.includes('Expected at least 5'));
    });
  });

  describe('getSnapshotPath', () => {
    it('should return correct path with zero-padded pass number', () => {
      const path1 = manager.getSnapshotPath(1);
      assert.match(path1, /after-pass-001\.js$/);

      const path99 = manager.getSnapshotPath(99);
      assert.match(path99, /after-pass-099\.js$/);

      const path123 = manager.getSnapshotPath(123);
      assert.match(path123, /after-pass-123\.js$/);
    });
  });

  describe('atomic writes', () => {
    it('should use atomic write pattern (temp + rename)', async () => {
      const code = 'function foo() { return 42; }';
      const snapshotPath = manager.getSnapshotPath(1);
      const tempPath = `${snapshotPath}.tmp`;

      await manager.saveSnapshot(1, code, 1);

      // Temp file should be cleaned up
      await assert.rejects(async () => {
        await fs.access(tempPath);
      });

      // Final file should exist
      await assert.doesNotReject(async () => {
        await fs.access(snapshotPath);
      });
    });

    it('should reject invalid JavaScript before saving', async () => {
      const invalidCode = 'function foo() { return 42'; // Missing closing brace

      await assert.rejects(
        async () => {
          await manager.saveSnapshot(1, invalidCode, 1);
        },
        /Snapshot validation failed/
      );

      // Snapshot should not exist
      const loaded = await manager.loadSnapshot(1);
      assert.equal(loaded, null);
    });

    it('should survive interrupted write (simulated)', async () => {
      const code = 'function foo() { return 42; }';

      // Write snapshot successfully
      await manager.saveSnapshot(1, code, 1);

      // Simulate interrupted write by leaving temp file
      const snapshotPath = manager.getSnapshotPath(1);
      const tempPath = `${snapshotPath}.tmp`;
      await fs.writeFile(tempPath, 'corrupted partial data', 'utf-8');

      // Loading should still work (reads final file, not temp)
      const loaded = await manager.loadSnapshot(1);
      assert.equal(loaded, code);
    });
  });

  describe('listSnapshots', () => {
    it('should list all snapshots in order', async () => {
      const code1 = 'function foo() { return 1; }';
      const code2 = 'function bar() { return 2; }';
      const code3 = 'function baz() { return 3; }';

      await manager.saveSnapshot(1, code1, 1);
      await manager.saveSnapshot(3, code3, 1);
      await manager.saveSnapshot(2, code2, 1);

      const snapshots = await manager.listSnapshots();
      assert.deepEqual(snapshots, [1, 2, 3]);
    });

    it('should return empty array when no snapshots exist', async () => {
      const snapshots = await manager.listSnapshots();
      assert.deepEqual(snapshots, []);
    });
  });

  describe('integration: full snapshot lifecycle', () => {
    it('should handle complete snapshot workflow', async () => {
      const originalCode = `
        function a() { return b(); }
        function b() { return 42; }
      `;

      const renamedCode = `
        function initialize() { return compute(); }
        function compute() { return 42; }
      `;

      // Save pass 0 (original)
      const meta0 = await manager.saveSnapshot(0, originalCode, 0);
      assert.equal(meta0.passNumber, 0);
      assert.equal(meta0.renameCount, 0);

      // Save pass 1 (renamed)
      const meta1 = await manager.saveSnapshot(1, renamedCode, 2);
      assert.equal(meta1.passNumber, 1);
      assert.equal(meta1.renameCount, 2);

      // Verify diff
      const diffResult = await manager.verifyDiff(originalCode, renamedCode, 2);
      assert.equal(diffResult.match, true);

      // Verify hashes
      const isValid0 = await manager.verifyHash(0, meta0.hash);
      const isValid1 = await manager.verifyHash(1, meta1.hash);
      assert.equal(isValid0, true);
      assert.equal(isValid1, true);

      // List all snapshots
      const snapshots = await manager.listSnapshots();
      assert.deepEqual(snapshots, [0, 1]);

      // Load snapshots
      const loaded0 = await manager.loadSnapshot(0);
      const loaded1 = await manager.loadSnapshot(1);
      assert.equal(loaded0, originalCode);
      assert.equal(loaded1, renamedCode);
    });
  });
});
