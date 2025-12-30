/**
 * Unit tests for Transformer
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { Transformer, RenameMap } from "./transformer.js";
import { existsSync, unlinkSync, mkdirSync, rmdirSync } from "fs";

describe("Transformer", () => {
  let transformer: Transformer;
  const testSnapshotDir = ".test-snapshots";

  before(() => {
    transformer = new Transformer({ validateOutput: true });

    // Create test snapshot directory
    if (!existsSync(testSnapshotDir)) {
      mkdirSync(testSnapshotDir, { recursive: true });
    }
  });

  after(() => {
    // Cleanup test snapshots
    if (existsSync(testSnapshotDir)) {
      try {
        rmdirSync(testSnapshotDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it("should apply simple renames", async () => {
    const code = `
      const x = 1;
      const y = 2;
      console.log(x + y);
    `;

    const renameMap: RenameMap = {
      "id:x": "value1",
      "id:y": "value2",
    };

    const identifierLocations = new Map([
      ["id:x", "x"],
      ["id:y", "y"],
    ]);

    const result = await transformer.transform(code, renameMap, identifierLocations);

    assert.ok(result.code.includes("value1"), "Should rename x to value1");
    assert.ok(result.code.includes("value2"), "Should rename y to value2");
    assert.ok(!result.code.includes("const x"), "Should not contain old name x");
    assert.ok(!result.code.includes("const y"), "Should not contain old name y");
  });

  it("should track applied and skipped renames", async () => {
    const code = `
      const a = 1;
      const b = 2;
    `;

    const renameMap: RenameMap = {
      "id:a": "alpha",
      "id:b": "beta",
      "id:nonexistent": "gamma",
    };

    const identifierLocations = new Map([
      ["id:a", "a"],
      ["id:b", "b"],
      // Note: id:nonexistent is not in locations map
    ]);

    const result = await transformer.transform(code, renameMap, identifierLocations);

    assert.strictEqual(result.applied, 2, "Should apply 2 renames");
    assert.strictEqual(result.skipped, 1, "Should skip 1 rename");
  });

  it("should handle naming collisions by prefixing with underscore", async () => {
    const code = `
      const a = 1;
      const b = 2;
    `;

    const renameMap: RenameMap = {
      "id:a": "value",
      "id:b": "value", // Collision!
    };

    const identifierLocations = new Map([
      ["id:a", "a"],
      ["id:b", "b"],
    ]);

    const result = await transformer.transform(code, renameMap, identifierLocations);

    // One should be renamed to 'value', other to '_value'
    assert.ok(result.code.includes("value"), "Should have at least one 'value'");
    assert.ok(result.collisions > 0, "Should report collisions");
  });

  it("should validate output is valid JavaScript", async () => {
    const code = `
      const x = 1;
    `;

    const renameMap: RenameMap = {
      "id:x": "validName",
    };

    const identifierLocations = new Map([["id:x", "x"]]);

    // Should not throw
    const result = await transformer.transform(code, renameMap, identifierLocations);

    assert.ok(result.code, "Should produce valid code");
  });

  it("should emit snapshot when configured", async () => {
    const code = `
      const x = 1;
    `;

    const renameMap: RenameMap = {
      "id:x": "renamedX",
    };

    const identifierLocations = new Map([["id:x", "x"]]);

    const snapshotPath = `${testSnapshotDir}/test-snapshot.js`;
    const snapshotTransformer = Transformer.withSnapshot(snapshotPath);

    const result = await snapshotTransformer.transform(
      code,
      renameMap,
      identifierLocations
    );

    assert.ok(result.snapshotPath, "Should have snapshot path");
    assert.strictEqual(result.snapshotPath, snapshotPath);
    assert.ok(result.snapshotHash, "Should have snapshot hash");
    assert.ok(existsSync(snapshotPath), "Snapshot file should exist");

    // Cleanup
    unlinkSync(snapshotPath);
  });

  it("should handle empty rename map", async () => {
    const code = `
      const x = 1;
    `;

    const renameMap: RenameMap = {};
    const identifierLocations = new Map();

    const result = await transformer.transform(code, renameMap, identifierLocations);

    assert.strictEqual(result.applied, 0, "Should apply 0 renames");
    assert.ok(result.code.includes("const x"), "Should preserve original code");
  });

  it("should rename all references when renaming binding", async () => {
    const code = `
      const data = [1, 2, 3];
      console.log(data);
      console.log(data);
      return data;
    `;

    const renameMap: RenameMap = {
      "id:data": "items",
    };

    const identifierLocations = new Map([["id:data", "data"]]);

    const result = await transformer.transform(code, renameMap, identifierLocations);

    // Count occurrences of 'items' (should be 4: 1 declaration + 3 references)
    const itemsCount = (result.code.match(/\bitems\b/g) || []).length;
    assert.strictEqual(itemsCount, 4, "Should rename all references");

    // Should not contain 'data' anymore
    const dataCount = (result.code.match(/\bdata\b/g) || []).length;
    assert.strictEqual(dataCount, 0, "Should not contain old name");
  });

  it("should handle function parameters", async () => {
    const code = `
      function add(a, b) {
        return a + b;
      }
    `;

    const renameMap: RenameMap = {
      "id:a": "first",
      "id:b": "second",
    };

    const identifierLocations = new Map([
      ["id:a", "a"],
      ["id:b", "b"],
    ]);

    const result = await transformer.transform(code, renameMap, identifierLocations);

    assert.ok(result.code.includes("first"), "Should rename parameter a");
    assert.ok(result.code.includes("second"), "Should rename parameter b");
  });

  it("should handle class names", async () => {
    const code = `
      class MyClass {
        method() {
          return new MyClass();
        }
      }
    `;

    const renameMap: RenameMap = {
      "id:MyClass": "RenamedClass",
    };

    const identifierLocations = new Map([["id:MyClass", "MyClass"]]);

    const result = await transformer.transform(code, renameMap, identifierLocations);

    assert.ok(result.code.includes("RenamedClass"), "Should rename class");
    assert.ok(!result.code.includes("MyClass"), "Should not contain old class name");
  });

  it("should preserve code structure", async () => {
    const code = `
      function example() {
        const x = 1;
        if (x > 0) {
          console.log(x);
        }
      }
    `;

    const renameMap: RenameMap = {
      "id:x": "value",
    };

    const identifierLocations = new Map([["id:x", "x"]]);

    const result = await transformer.transform(code, renameMap, identifierLocations);

    // Code should still parse and have same structure
    assert.ok(result.code.includes("function"), "Should preserve function");
    assert.ok(result.code.includes("if"), "Should preserve if statement");
    assert.ok(result.code.includes("console.log"), "Should preserve console.log");
  });
});
