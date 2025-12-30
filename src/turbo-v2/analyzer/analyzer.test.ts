/**
 * Unit tests for Analyzer
 */

import { describe, it, before } from "node:test";
import assert from "node:assert";
import { Analyzer } from "./analyzer.js";

describe("Analyzer", () => {
  let analyzer: Analyzer;

  before(() => {
    analyzer = new Analyzer();
  });

  it("should extract identifiers from simple code", async () => {
    const code = `
      function add(a, b) {
        return a + b;
      }
      const result = add(1, 2);
    `;

    const analysis = await analyzer.analyze(code);

    assert.ok(analysis.identifiers.length > 0, "Should find identifiers");
    assert.strictEqual(analysis.totalIdentifiers, analysis.identifiers.length);

    // Should find: add, a, b, result
    const names = analysis.identifiers.map((id) => id.name);
    assert.ok(names.includes("add"), "Should find function 'add'");
    assert.ok(names.includes("result"), "Should find variable 'result'");
  });

  it("should extract binding types correctly", async () => {
    const code = `
      function myFunc() {}
      class MyClass {}
      const myVar = 1;
      import myImport from 'module';
    `;

    const analysis = await analyzer.analyze(code);

    const funcIdentifier = analysis.identifiers.find((id) => id.name === "myFunc");
    const classIdentifier = analysis.identifiers.find((id) => id.name === "MyClass");
    const varIdentifier = analysis.identifiers.find((id) => id.name === "myVar");

    assert.strictEqual(funcIdentifier?.bindingType, "function");
    assert.strictEqual(classIdentifier?.bindingType, "class");
    assert.strictEqual(varIdentifier?.bindingType, "var");
  });

  it("should calculate reference counts", async () => {
    const code = `
      const data = [1, 2, 3];
      console.log(data);
      console.log(data);
      console.log(data);
    `;

    const analysis = await analyzer.analyze(code);

    const dataIdentifier = analysis.identifiers.find((id) => id.name === "data");
    assert.ok(dataIdentifier, "Should find 'data' identifier");
    assert.strictEqual(dataIdentifier.references, 3, "Should count 3 references");
  });

  it("should extract context around identifiers", async () => {
    const code = `
      function calculate(x, y) {
        const sum = x + y;
        return sum;
      }
    `;

    const analysis = await analyzer.analyze(code);

    const sumIdentifier = analysis.identifiers.find((id) => id.name === "sum");
    assert.ok(sumIdentifier, "Should find 'sum' identifier");
    assert.ok(sumIdentifier.context.length > 0, "Should have context");
    assert.ok(sumIdentifier.context.includes("sum"), "Context should include identifier");
  });

  it("should calculate importance scores", async () => {
    const code = `
      export class ImportantClass {
        method() {
          const temp = 1;
          return temp;
        }
      }
    `;

    const analysis = await analyzer.analyze(code);

    const classId = analysis.identifiers.find((id) => id.name === "ImportantClass");
    const tempId = analysis.identifiers.find((id) => id.name === "temp");

    assert.ok(classId, "Should find class");
    assert.ok(tempId, "Should find temp variable");

    // Classes should have higher importance than local variables
    assert.ok(
      classId.importance > tempId.importance,
      "Class should have higher importance than local variable"
    );
  });

  it("should sort identifiers by importance", async () => {
    const code = `
      export function publicFunc() {}
      const helper = () => {};
      let temp = 1;
    `;

    const analysis = await analyzer.analyze(code);

    // Identifiers should be sorted by importance (highest first)
    for (let i = 1; i < analysis.identifiers.length; i++) {
      assert.ok(
        analysis.identifiers[i - 1].importance >= analysis.identifiers[i].importance,
        "Identifiers should be sorted by importance descending"
      );
    }
  });

  it("should generate stable identifier IDs", async () => {
    const code = `
      const x = 1;
      const y = 2;
    `;

    const analysis1 = await analyzer.analyze(code);
    const analysis2 = await analyzer.analyze(code);

    // Same code should produce same IDs
    for (let i = 0; i < analysis1.identifiers.length; i++) {
      assert.strictEqual(
        analysis1.identifiers[i].id,
        analysis2.identifiers[i].id,
        "Identifier IDs should be stable across parses"
      );
    }
  });

  it("should handle 5000+ identifiers without OOM", async () => {
    // Generate large code sample
    const lines: string[] = [];
    for (let i = 0; i < 5000; i++) {
      lines.push(`const var${i} = ${i};`);
    }
    const code = lines.join("\n");

    const analysis = await analyzer.analyze(code);

    assert.ok(analysis.totalIdentifiers >= 5000, "Should handle 5000+ identifiers");
    assert.strictEqual(
      analysis.identifiers.length,
      analysis.totalIdentifiers,
      "Count should match array length"
    );
  });

  it("should include location information", async () => {
    const code = `
      const x = 1;
    `;

    const analysis = await analyzer.analyze(code);

    const xId = analysis.identifiers.find((id) => id.name === "x");
    assert.ok(xId, "Should find identifier");
    assert.ok(xId.location, "Should have location");
    assert.ok(xId.location.start.line > 0, "Should have line number");
    assert.ok(xId.location.start.column >= 0, "Should have column number");
  });

  it("should compute code hash for change detection", async () => {
    const code1 = "const x = 1;";
    const code2 = "const x = 2;";

    const analysis1 = await analyzer.analyze(code1);
    const analysis2 = await analyzer.analyze(code2);

    assert.notStrictEqual(
      analysis1.codeHash,
      analysis2.codeHash,
      "Different code should have different hashes"
    );
  });

  it("should include timestamp in analysis", async () => {
    const code = "const x = 1;";
    const analysis = await analyzer.analyze(code);

    assert.ok(analysis.timestamp, "Should have timestamp");

    // Validate ISO 8601 format
    const timestamp = new Date(analysis.timestamp);
    assert.ok(!isNaN(timestamp.getTime()), "Timestamp should be valid ISO 8601");
  });
});
