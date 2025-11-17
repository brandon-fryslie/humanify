import assert from "node:assert";
import test from "node:test";
import fs from "fs/promises";
import path from "path";
import { discoverOutputFiles } from "./openai.js";

test("discoverOutputFiles: finds all .js files", async () => {
  const testDir = "./test-discovery-all";
  await fs.mkdir(testDir, { recursive: true });

  try {
    // Create test files
    await fs.writeFile(path.join(testDir, "bundle_1.js"), "code1");
    await fs.writeFile(path.join(testDir, "bundle_2.js"), "code2");
    await fs.writeFile(path.join(testDir, "index.js"), "code3");
    await fs.writeFile(path.join(testDir, "bundle_1.js.map"), "sourcemap"); // Should be excluded
    await fs.writeFile(path.join(testDir, "readme.txt"), "docs"); // Should be excluded

    const files = await discoverOutputFiles(testDir);

    assert.strictEqual(files.length, 3, "Should find exactly 3 .js files");
    assert.ok(files.every(f => f.endsWith('.js')), "All files should end with .js");
    assert.ok(files.every(f => !f.includes('.map')), "Should exclude sourcemap files");
    assert.ok(files.every(f => path.isAbsolute(f)), "Should return absolute paths");

    // Verify alphabetical sorting
    const basenames = files.map(f => path.basename(f));
    assert.deepStrictEqual(basenames, ['bundle_1.js', 'bundle_2.js', 'index.js']);
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("discoverOutputFiles: throws on non-existent directory", async () => {
  await assert.rejects(
    discoverOutputFiles("./does-not-exist-12345"),
    /Failed to discover output files/
  );
});

test("discoverOutputFiles: returns empty array for empty directory", async () => {
  const testDir = "./test-empty-dir";
  await fs.mkdir(testDir, { recursive: true });

  try {
    const files = await discoverOutputFiles(testDir);
    assert.strictEqual(files.length, 0, "Should return empty array");
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("discoverOutputFiles: excludes .js.map files", async () => {
  const testDir = "./test-exclude-maps";
  await fs.mkdir(testDir, { recursive: true });

  try {
    await fs.writeFile(path.join(testDir, "app.js"), "code");
    await fs.writeFile(path.join(testDir, "app.js.map"), "sourcemap");
    await fs.writeFile(path.join(testDir, "vendor.js.map"), "sourcemap");

    const files = await discoverOutputFiles(testDir);

    assert.strictEqual(files.length, 1, "Should find only 1 .js file");
    assert.ok(files[0].endsWith('app.js'), "Should include app.js");
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("discoverOutputFiles: excludes non-JS files", async () => {
  const testDir = "./test-exclude-non-js";
  await fs.mkdir(testDir, { recursive: true });

  try {
    await fs.writeFile(path.join(testDir, "script.js"), "code");
    await fs.writeFile(path.join(testDir, "data.json"), "{}");
    await fs.writeFile(path.join(testDir, "style.css"), "body {}");
    await fs.writeFile(path.join(testDir, "readme.md"), "# Docs");

    const files = await discoverOutputFiles(testDir);

    assert.strictEqual(files.length, 1, "Should find only 1 .js file");
    assert.ok(files[0].endsWith('script.js'), "Should include script.js");
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("discoverOutputFiles: handles directory with only non-JS files", async () => {
  const testDir = "./test-no-js-files";
  await fs.mkdir(testDir, { recursive: true });

  try {
    await fs.writeFile(path.join(testDir, "data.json"), "{}");
    await fs.writeFile(path.join(testDir, "readme.txt"), "docs");

    const files = await discoverOutputFiles(testDir);

    assert.strictEqual(files.length, 0, "Should return empty array");
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("discoverOutputFiles: sorts files alphabetically", async () => {
  const testDir = "./test-sort-alphabetically";
  await fs.mkdir(testDir, { recursive: true });

  try {
    // Create files in non-alphabetical order
    await fs.writeFile(path.join(testDir, "z.js"), "code");
    await fs.writeFile(path.join(testDir, "a.js"), "code");
    await fs.writeFile(path.join(testDir, "m.js"), "code");

    const files = await discoverOutputFiles(testDir);
    const basenames = files.map(f => path.basename(f));

    assert.deepStrictEqual(basenames, ['a.js', 'm.js', 'z.js'], "Should be sorted alphabetically");
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("discoverOutputFiles: ignores subdirectories", async () => {
  const testDir = "./test-ignore-subdirs";
  await fs.mkdir(testDir, { recursive: true });
  await fs.mkdir(path.join(testDir, "subdir"), { recursive: true });

  try {
    await fs.writeFile(path.join(testDir, "main.js"), "code");
    await fs.writeFile(path.join(testDir, "subdir", "nested.js"), "code");

    const files = await discoverOutputFiles(testDir);

    assert.strictEqual(files.length, 1, "Should find only top-level .js file");
    assert.ok(files[0].endsWith('main.js'), "Should include main.js");
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("discoverOutputFiles: returns absolute paths", async () => {
  const testDir = "./test-absolute-paths";
  await fs.mkdir(testDir, { recursive: true });

  try {
    await fs.writeFile(path.join(testDir, "test.js"), "code");

    const files = await discoverOutputFiles(testDir);

    assert.strictEqual(files.length, 1);
    assert.ok(path.isAbsolute(files[0]), "Path should be absolute");
    
    // Verify the file actually exists at the returned path
    const fileExists = await fs.access(files[0]).then(() => true).catch(() => false);
    assert.ok(fileExists, "File should exist at returned absolute path");
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("discoverOutputFiles: handles multiple files with similar names", async () => {
  const testDir = "./test-similar-names";
  await fs.mkdir(testDir, { recursive: true });

  try {
    await fs.writeFile(path.join(testDir, "bundle.js"), "code");
    await fs.writeFile(path.join(testDir, "bundle_1.js"), "code");
    await fs.writeFile(path.join(testDir, "bundle_10.js"), "code");
    await fs.writeFile(path.join(testDir, "bundle_2.js"), "code");

    const files = await discoverOutputFiles(testDir);
    const basenames = files.map(f => path.basename(f));

    // Alphabetical sort (not numeric)
    assert.deepStrictEqual(basenames, [
      'bundle.js',
      'bundle_1.js',
      'bundle_10.js',
      'bundle_2.js'
    ]);
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});
