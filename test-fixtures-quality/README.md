# Test Fixtures for Deobfuscation Quality Tests

This directory contains test fixtures used by the deobfuscation quality test suite.

## Purpose

Test fixtures are created dynamically by the E2E tests in `src/cli-output-quality.e2etest.ts`. This directory serves as a staging area for test input files during test execution.

## Fixture Files

Fixtures are small, focused JavaScript files that demonstrate specific obfuscation patterns:

- **simple-obfuscated.js** - Basic function with single-letter variables
- **multiple-functions.js** - Multiple functions and declarations
- **structure-test.js** - Code with complex control flow (if/else)
- **baseline-test.js** - Loop with multiple single-letter variables

## Test Strategy

Each fixture is designed to be:

1. **Minimal** - Small enough to process quickly in tests
2. **Clear** - Obviously obfuscated (single-letter variables)
3. **Valid** - Syntactically correct JavaScript
4. **Representative** - Demonstrates real-world obfuscation patterns

## Cleanup

Test fixtures are created fresh for each test run and cleaned up automatically. This directory may be empty when not running tests.
