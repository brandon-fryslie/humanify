/**
 * Tests for pass argument parser
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { parsePassArg, parsePassArgs, validatePassFlags, PassParseError } from "./pass-parser.js";

describe("parsePassArg", () => {
  it("should parse basic pass config", () => {
    const result = parsePassArg("rename:parallel:50");

    assert.strictEqual(result.processor, "rename");
    assert.strictEqual(result.mode, "parallel");
    assert.strictEqual(result.concurrency, 50);
    assert.strictEqual(result.filter, undefined);
    assert.strictEqual(result.model, undefined);
  });

  it("should parse pass config with filter", () => {
    const result = parsePassArg("rename:sequential:1:anchors");

    assert.strictEqual(result.processor, "rename");
    assert.strictEqual(result.mode, "sequential");
    assert.strictEqual(result.concurrency, 1);
    assert.strictEqual(result.filter, "anchors");
    assert.strictEqual(result.model, undefined);
  });

  it("should parse pass config with options", () => {
    const result = parsePassArg("refine:parallel:30:low-confidence:model=gpt-4o");

    assert.strictEqual(result.processor, "refine");
    assert.strictEqual(result.mode, "parallel");
    assert.strictEqual(result.concurrency, 30);
    assert.strictEqual(result.filter, "low-confidence");
    assert.strictEqual(result.model, "gpt-4o");
  });

  it("should reject invalid processor", () => {
    assert.throws(
      () => parsePassArg("invalid:parallel:50"),
      (error: any) => error instanceof PassParseError && error.message.includes("Invalid processor")
    );
  });

  it("should reject invalid mode", () => {
    assert.throws(
      () => parsePassArg("rename:invalid:50"),
      (error: any) => error instanceof PassParseError && error.message.includes("Invalid mode")
    );
  });

  it("should reject invalid concurrency", () => {
    assert.throws(
      () => parsePassArg("rename:parallel:zero"),
      (error: any) => error instanceof PassParseError && error.message.includes("Invalid concurrency")
    );
  });

  it("should reject negative concurrency", () => {
    assert.throws(
      () => parsePassArg("rename:parallel:-1"),
      (error: any) => error instanceof PassParseError && error.message.includes("Invalid concurrency")
    );
  });

  it("should reject invalid filter", () => {
    assert.throws(
      () => parsePassArg("rename:parallel:50:invalid"),
      (error: any) => error instanceof PassParseError && error.message.includes("Invalid filter")
    );
  });

  it("should reject too few parts", () => {
    assert.throws(
      () => parsePassArg("rename:parallel"),
      (error: any) => error instanceof PassParseError && error.message.includes("at least 3 parts")
    );
  });
});

describe("parsePassArgs", () => {
  it("should parse multiple pass arguments", () => {
    const results = parsePassArgs([
      "rename:parallel:50",
      "refine:parallel:30",
    ]);

    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].processor, "rename");
    assert.strictEqual(results[0].concurrency, 50);
    assert.strictEqual(results[1].processor, "refine");
    assert.strictEqual(results[1].concurrency, 30);
  });

  it("should provide helpful error for invalid argument", () => {
    assert.throws(
      () => parsePassArgs(["rename:parallel:50", "invalid:mode:10"]),
      (error: any) =>
        error instanceof PassParseError &&
        error.message.includes("argument #2") &&
        error.message.includes("Invalid mode")
    );
  });
});

describe("validatePassFlags", () => {
  it("should allow passes flag alone", () => {
    assert.doesNotThrow(() => validatePassFlags({ passes: 3 }));
  });

  it("should allow pass flag alone", () => {
    assert.doesNotThrow(() => validatePassFlags({ pass: ["rename:parallel:50"] }));
  });

  it("should allow preset flag alone", () => {
    assert.doesNotThrow(() => validatePassFlags({ preset: "fast" }));
  });

  it("should reject mixing passes and pass", () => {
    assert.throws(
      () => validatePassFlags({ passes: 3, pass: ["rename:parallel:50"] }),
      (error: any) => error.message.includes("Cannot mix --passes and --pass")
    );
  });

  it("should reject mixing preset and pass", () => {
    assert.throws(
      () => validatePassFlags({ preset: "fast", pass: ["rename:parallel:50"] }),
      (error: any) => error.message.includes("Cannot mix --preset and --pass")
    );
  });

  it("should allow no flags", () => {
    assert.doesNotThrow(() => validatePassFlags({}));
  });
});
