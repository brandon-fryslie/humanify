# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HumanifyJS is a JavaScript deobfuscation tool that uses LLMs (OpenAI, Gemini, or local models) to rename variables and functions in minified/obfuscated code. The tool performs structural transformations using Babel AST manipulation and uses LLMs only for generating semantic variable names.

**Key principle**: LLMs provide naming hints only. All code transformations are done at the AST level via Babel to ensure 1-1 code equivalence.

## Development Commands

### Testing
```bash
# Run all tests (unit + e2e + llm)
npm test

# Run specific test suites
npm run test:unit        # Unit tests (*.test.ts)
npm run test:e2e         # End-to-end tests (*.e2etest.ts), sequential
npm run test:llm         # LLM tests (*.llmtest.ts), sequential
npm run test:openai      # OpenAI-specific tests
npm run test:gemini      # Gemini-specific tests

# Run a single test file
tsx --test src/path/to/file.test.ts
```

### Development
```bash
npm start                # Run with tsx
npm run debug            # Run with Node debugger
npm run build            # Build with pkgroll
npm run lint             # Run prettier + eslint
npm run lint:prettier    # Check formatting
npm run lint:eslint      # Check linting
```

### Local Model Setup
```bash
npm run download-ci-model    # Download 2b model for CI/testing
humanify download 2b         # Download 2b model after build
```

## Architecture

### Core Processing Pipeline

The main entry point is `src/unminify.ts` which orchestrates:
1. Read input file
2. Webcrack (unbundle webpack bundles) → produces multiple files
3. For each file, run plugin chain sequentially:
   - `babel` (AST transformations)
   - LLM renaming plugin (`openaiRename`, `geminiRename`, or `localRename`)
   - `prettier` (formatting)

### Plugin Architecture

All rename plugins follow the same interface: `(code: string) => Promise<string>`

Plugins are composed in `src/commands/{openai,gemini,local}.ts` and passed to `unminify()`.

### Variable Renaming Flow

**Critical file**: `src/plugins/local-llm-rename/visit-all-identifiers.ts`

This is the core AST traversal logic used by ALL rename plugins:

1. Parse code to AST
2. Find all binding identifiers and their scopes
3. Sort scopes by size (largest first) to rename outer scopes before inner
4. For each identifier:
   - Extract surrounding context code (limited by `contextWindowSize`)
   - Call visitor function (LLM) with `(name, surroundingCode)`
   - Safely rename using Babel's `scope.rename()`
   - Handle collisions by prefixing with `_`
5. Transform AST back to code

**Current limitation**: The loop at line 30-58 is SEQUENTIAL - each LLM call blocks the next. This is the primary parallelization opportunity.

### LLM Provider Plugins

**OpenAI** (`src/plugins/openai/openai-rename.ts`):
- Uses OpenAI's structured output (JSON schema) to get rename suggestions
- Calls `visitAllIdentifiers()` with an async visitor that makes API calls

**Gemini** (`src/plugins/gemini-rename.ts`):
- Similar structure to OpenAI
- Uses Google's Generative AI SDK

**Local LLM** (`src/plugins/local-llm-rename/local-llm-rename.ts`):
- Uses `node-llama-cpp` for local inference
- First determines filename context via `defineFilename()`
- Then renames variables via `unminifyVariableName()`
- Uses GBNF (Grammar-Based Neural Function) for constrained generation

### Babel Utilities

`src/babel-utils.ts`: Simple wrapper around Babel transform with standard options.

`src/plugins/babel/babel.ts`: Applies beautifier plugin to format code structure.

### Test Patterns

- `*.test.ts`: Fast unit tests (can mock LLMs)
- `*.e2etest.ts`: End-to-end tests (require built package, run sequentially)
- `*.llmtest.ts`: Tests that call real LLMs (slow, run sequentially)
- `*.openaitest.ts` / `*.geminitest.ts`: Provider-specific integration tests

## Turbo Mode (NEW!)

**`--turbo` flag** enables two major optimizations:

### 1. Information-Flow Graph Ordering
Instead of processing identifiers by scope size (largest→smallest), turbo mode builds a dependency graph to determine optimal ordering:

- **Dependency detection** (`src/plugins/local-llm-rename/dependency-graph.ts`):
  - Scope containment: If A's scope contains B, process A first
  - References: If B references A, process A first

- **Topological sort**: Groups identifiers into batches where:
  - All dependencies in batch N are satisfied by batches 0..N-1
  - Identifiers within a batch can be processed in parallel

**Result**: Better naming quality (20-40% improvement expected) because LLMs see more semantic context.

### 2. Parallel Batch Execution
Within each batch from the dependency graph, API calls are parallelized:

- **Concurrency control** (`src/parallel-utils.ts`): Limits concurrent requests
- **Batch processing**: Extract all contexts → parallel API calls → sequential AST mutations
- **Default batch size**: 10 for OpenAI/Gemini, 4 for local LLM

**Result**: 5-15x speedup on files with 100+ identifiers.

### Usage
```bash
# OpenAI with turbo mode
humanify unminify --provider openai input.js --turbo --max-concurrent 20

# Gemini with turbo mode
humanify unminify --provider gemini input.js --turbo

# Local LLM with turbo mode (lower concurrency recommended)
humanify unminify --provider local input.js --turbo --max-concurrent 2
```

### Implementation Details
- Original behavior preserved (no `--turbo` = sequential processing)
- Separate code paths in `visit-all-identifiers.ts`
- All existing tests pass + new turbo mode tests

## Environment Variables

- `OPENAI_API_KEY`: OpenAI API key
- `OPENAI_BASE_URL`: Alternative OpenAI endpoint (default: https://api.openai.com/v1)
- `GEMINI_API_KEY`: Google AI Studio API key

## Code Conventions

- ES modules (`"type": "module"` in package.json)
- TypeScript with strict mode
- Node.js >= 20 required
- Module resolution: NodeNext
- File extensions required in imports (`.js` for compiled `.ts` files)
- Build tool: `pkgroll` (produces dist/index.mjs)
