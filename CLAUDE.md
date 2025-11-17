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

### Just Commands (Recommended)
The project includes a `justfile` with pre-configured recipes for testing with real-world files:

```bash
just                          # List all available commands
just build                    # Build the project
just test                     # Run test suite
just test-tensorflow          # Process TensorFlow.js (1.4MB, ~35K identifiers)
just test-babylon             # Process Babylon.js (7.2MB, ~82K identifiers)
just test-small               # Quick test on small sample
just download-tensorflow      # Download TensorFlow.js test sample
just download-babylon         # Download Babylon.js test sample
just clean                    # Clean output directories
just stats                    # Show test sample file stats
```

These recipes demonstrate optimal turbo mode settings for different file sizes and complexity levels.

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

## Large File Handling

### Automatic Chunking (NEW!)

For extremely large files (>100KB by default), HumanifyJS automatically splits the file into chunks to prevent out-of-memory errors.

**How it works**:
1. **AST-based splitting** (`file-splitter.ts`): Splits at top-level statement boundaries while tracking symbols
2. **Independent processing**: Each chunk is processed through the full plugin pipeline
3. **Intelligent reassembly** (`chunk-reassembler.ts`): Merges chunks back while preserving structure

**Configuration**:
```bash
--chunk-size N              # Threshold for chunking (default: 100000 chars)
--enable-chunking false     # Disable automatic chunking
--debug-chunks              # Add chunk boundary markers in output
```

**When to use**:
- Files >100KB that cause OOM errors
- Files with 10,000+ identifiers
- Processing on machines with limited RAM

**Implementation files**:
- `src/unminify.ts`: Chunking orchestration (lines 88-192)
- `src/file-splitter.ts`: AST-based splitting logic
- `src/chunk-processor.ts`: Per-chunk plugin application
- `src/chunk-reassembler.ts`: Merging processed chunks

## Turbo Mode

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

### Advanced Turbo Mode Options
```bash
# Fine-tune batch processing
--min-batch-size N          # Merge small batches (default: 1)
--max-batch-size N          # Split large batches to prevent memory spikes (default: 100)

# Dependency graph modes
--dependency-mode strict    # Maximum dependencies, best quality (slowest)
--dependency-mode balanced  # Good quality/speed trade-off (default)
--dependency-mode relaxed   # Fewer dependencies, fastest (may miss some context)

# Memory management
--max-memory N              # Trigger GC when memory exceeds N MB
--perf                      # Enable performance instrumentation/telemetry

# Context size
--context-size N            # Characters of surrounding code sent to LLM (default varies by provider)
```

**Example for large files** (7MB+):
```bash
humanify unminify --provider openai large.js \
  --turbo \
  --max-concurrent 30 \
  --min-batch-size 10 \
  --max-batch-size 100 \
  --context-size 50000 \
  --dependency-mode relaxed \
  --max-memory 4096 \
  --perf
```

### Implementation Details
- Original behavior preserved (no `--turbo` = sequential processing)
- Separate code paths in `visit-all-identifiers.ts`
- Dependency graph with caching (`dependency-cache.ts`)
- Parallel execution with concurrency control (`parallel-utils.ts`)
- All existing tests pass + new turbo mode tests

### Dependency Graph Deep Dive

**Core algorithm** (`src/plugins/local-llm-rename/dependency-graph.ts`):

1. **Edge detection**: Identifies two types of dependencies:
   - **Scope containment**: Outer scopes processed before inner scopes
   - **References**: Referenced identifiers processed before referencing identifiers

2. **Topological sort**: Groups identifiers into batches where all dependencies are satisfied
   - Batch N can only depend on batches 0..N-1
   - Identifiers within same batch can be processed in parallel

3. **Batch optimization**:
   - **Merging** (`mergeBatches`): Combines small batches to improve parallelization
   - **Splitting** (`splitLargeBatches`): Prevents memory spikes from huge batches

4. **Caching**: Dependency graphs are cached by code hash for faster re-runs

**Three dependency modes**:
- `strict`: Maximum context (all scope + reference edges) → best quality, slowest
- `balanced`: Scope containment + direct references → good trade-off (default)
- `relaxed`: Scope containment only → fastest, may miss contextual hints

**Key insight**: This is an information-flow optimization, not just parallelization. By ensuring LLMs see already-renamed dependent variables, the quality of suggestions improves significantly (20-40% in testing).

## Observability & Performance

### Instrumentation
The codebase includes comprehensive instrumentation for performance analysis:

**Key modules**:
- `src/instrumentation.ts`: Spans and timing metrics for all major operations
- `src/memory-monitor.ts`: Memory usage tracking with checkpoints
- `src/progress.ts`: Progress reporting for long-running operations

**Enabling telemetry**:
```bash
humanify unminify --provider openai input.js --perf
```

This outputs detailed metrics for:
- AST parsing time
- Dependency graph construction
- Batch processing times
- LLM API call durations
- Memory usage at key checkpoints

**Usage in code**: All performance-critical sections are wrapped with `instrumentation.measure()` or `instrumentation.measureSync()`.

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
- You can find the OpenAI API key in the .env file in the root of the project