/**
 * Transformer Collision Detection Tests
 *
 * Minimal test cases to reproduce and fix rename collision issues.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { Transformer, RenameMap } from "./transformer.js";

describe("Transformer Collision Detection", () => {
  let transformer: Transformer;

  beforeEach(() => {
    transformer = new Transformer({ validateOutput: true });
  });

  describe("Function parameter collisions", () => {
    it("should detect when two parameters are renamed to the same name", async () => {
      // Two different parameters (a, b) both renamed to "config"
      const code = `function test(a, b) { return a + b; }`;
      const renameMap: RenameMap = {
        "param-a": "config",
        "param-b": "config",  // Same name - should be detected!
      };
      const identifierLocations = new Map([
        ["param-a", "a"],
        ["param-b", "b"],
      ]);

      const result = await transformer.transform(code, renameMap, identifierLocations);

      // Should succeed (collision handled)
      assert.ok(result.code.includes("function test"));
      // One of them should be prefixed
      assert.ok(
        result.code.includes("_config") || result.collisions > 0,
        `Expected collision handling, got: ${result.code}`
      );
      // Both params should still exist
      assert.ok(result.applied >= 1, `Expected at least 1 applied, got ${result.applied}`);
    });
  });

  describe("Module-level collisions", () => {
    it("should detect when two module-level declarations are renamed to same name", async () => {
      // Two different top-level declarations both renamed to "ChartElement"
      const code = `
const a = 1;
const b = 2;
export { a, b };
`;
      const renameMap: RenameMap = {
        "decl-a": "ChartElement",
        "decl-b": "ChartElement",  // Same name - collision!
      };
      const identifierLocations = new Map([
        ["decl-a", "a"],
        ["decl-b", "b"],
      ]);

      const result = await transformer.transform(code, renameMap, identifierLocations);

      // Should succeed without throwing
      assert.ok(result.code.includes("ChartElement"));
      // One should be prefixed
      assert.ok(
        result.code.includes("_ChartElement") || result.collisions > 0,
        `Expected collision handling, got: ${result.code}`
      );
    });

    it("should detect when two class declarations are renamed to same name", async () => {
      const code = `
class A {}
class B {}
export { A, B };
`;
      const renameMap: RenameMap = {
        "class-a": "Element",
        "class-b": "Element",  // Collision!
      };
      const identifierLocations = new Map([
        ["class-a", "A"],
        ["class-b", "B"],
      ]);

      const result = await transformer.transform(code, renameMap, identifierLocations);

      // Should succeed
      assert.ok(result.code.includes("Element"));
      assert.ok(
        result.code.includes("_Element") || result.collisions > 0,
        `Expected collision handling, got: ${result.code}`
      );
    });
  });

  describe("Export statement handling", () => {
    it("should update export statements when bindings are renamed", async () => {
      const code = `
const Animation = 1;
export { Animation };
`;
      const renameMap: RenameMap = {
        "decl-animation": "CanvasAnimation",
      };
      const identifierLocations = new Map([
        ["decl-animation", "Animation"],
      ]);

      const result = await transformer.transform(code, renameMap, identifierLocations);

      // Export should reference the new name
      assert.ok(
        result.code.includes("export { CanvasAnimation") ||
        result.code.includes("export {CanvasAnimation"),
        `Expected export to use new name, got: ${result.code}`
      );
    });

    it("should handle export collision when renamed binding conflicts", async () => {
      // This tests the case where two bindings get renamed and one takes the other's original name
      const code = `
const a = 1;
const b = 2;
export { a, b };
`;
      const renameMap: RenameMap = {
        "decl-a": "beta",   // a -> beta
        "decl-b": "alpha",  // b -> alpha (swapping conceptually)
      };
      const identifierLocations = new Map([
        ["decl-a", "a"],
        ["decl-b", "b"],
      ]);

      const result = await transformer.transform(code, renameMap, identifierLocations);

      // Both exports should reference correct bindings
      assert.ok(result.code.includes("beta"), `Expected beta in: ${result.code}`);
      assert.ok(result.code.includes("alpha"), `Expected alpha in: ${result.code}`);
    });
  });
});
