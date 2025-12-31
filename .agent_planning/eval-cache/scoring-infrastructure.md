# Scoring Infrastructure Knowledge Cache

**Last Updated**: 2025-12-31 00:24
**Confidence**: HIGH
**Source**: project-evaluator

## Architecture

### Core Components

**Scoring Script** (`scripts/score-semantic.ts`):
- LLM-as-judge using GPT-4o
- Extracts identifiers via Babel AST traversal
- Samples to max 200 identifiers (deterministic)
- Returns score (0-100), explanation, tokens, cost
- Output: JSON to stdout

**Wrapper Script** (`scripts/score-sample.sh`):
- Takes `<sample>` and `<mode>` arguments
- Resolves paths: `test-samples/canonical/{sample}/output-{mode}/`
- Handles dual output names: `output.js` (V2) or `deobfuscated.js` (V1)
- Loads API key from `~/.rad-aik` or `OPENAI_API_KEY`
- Calls `score-semantic.ts` with original + unminified paths

**Batch Script** (`scripts/run-semantic-scoring-all.sh`):
- Parallel execution (launches all scoring jobs with `&`)
- Hardcoded mode list: `sequential turbo turbo-refine turbo-v2`
- Saves results to `{output-dir}/semantic-score.json`
- Generates summary table at end

## Test Sample Structure

**Location**: `test-samples/canonical/{sample}/`

**Files**:
- `minified.js` - Input file (obfuscated)
- `original.js` - Ground truth (pre-minification source)
- `output-{mode}/` - Per-mode output directories
  - `output.js` or `deobfuscated.js` - Deobfuscated code
  - `semantic-score.json` - Scoring results

**Samples**:
- `tiny-qs` - 150 identifiers, 356 lines
- `small-axios` - 800 identifiers, 3K lines
- `medium-chart` - 5000 identifiers, 11K lines

## Current Modes (4)

1. **sequential** - No turbo, baseline quality
2. **turbo** - V1 turbo with dependency graph
3. **turbo-refine** - V1 turbo + 2nd refinement pass
4. **turbo-v2** - V2 multi-pass orchestrator (default: fast preset)

**Note**: Turbo-v2 supports 5 presets (fast, balanced, thorough, quality, anchor) but currently only one mode name.

## Output Naming Convention

**V1 modes** (`sequential`, `turbo`, `turbo-refine`):
- Output file: `deobfuscated.js`

**V2 modes** (`turbo-v2`):
- Output file: `output.js`

**Compatibility**: `score-sample.sh` checks both names (prefers `output.js`, falls back to `deobfuscated.js`).

## Justfile Recipes

**Pattern**: `{action}-{sample}-{mode}` or `{action}-{mode}`

**Examples**:
- `just score tiny-qs turbo` - Score specific sample+mode
- `just score-all` - Score all samples in all modes
- `just run-turbo tiny-qs 10` - Run turbo mode on sample

**Total**: ~33 recipes (18 run + 15 score)

## Hardcoded Mode Lists

**Locations**:
1. `scripts/run-semantic-scoring-all.sh:64` - Batch scoring loop
2. `scripts/score-sample.sh:15` - Available modes comment
3. `justfile` - Individual recipes (15 scoring recipes)

**Impact**: Adding new mode requires updating all 3 files.

## How to Run Scoring

**Single sample+mode**:
```bash
./scripts/score-sample.sh tiny-qs turbo
# or
just score tiny-qs turbo
```

**All samples, all modes**:
```bash
./scripts/run-semantic-scoring-all.sh
# or
just score-all
```

**Direct scoring** (any two files):
```bash
npx tsx scripts/score-semantic.ts original.js unminified.js
# or
just score-files original.js unminified.js
```

## Semantic Score Format

**File**: `{output-dir}/semantic-score.json`

**Schema**:
```json
{
  "originalFile": "path/to/original.js",
  "unminifiedFile": "path/to/unminified.js",
  "originalIdentifierCount": 60,
  "unminifiedIdentifierCount": 66,
  "score": 75,
  "explanation": "...",
  "tokensUsed": 898,
  "cost": 0.00449
}
```

## Identifier Extraction

**Method**: Babel AST traversal
**Node Type**: `BindingIdentifier` (declarations only, not references)
**Filtering**: Skip single-letter names (likely still minified)
**Sampling**: Every Nth identifier if count > 200 (deterministic)

## API Key Management

**Priority**:
1. `~/.rad-aik` (base64-encoded)
2. `.env` file (`OPENAI_API_KEY=...`)
3. `OPENAI_API_KEY` environment variable

**Used by**:
- `score-sample.sh`
- `run-semantic-scoring-all.sh`
- `run-*.sh` scripts

## Known Limitations

1. **Hardcoded mode lists** - Manual sync across 3 files
2. **No mode discovery** - Can't programmatically list available modes
3. **No mode metadata** - Descriptions, parameters not centralized
4. **Output filename inconsistency** - V1 vs V2 naming (mitigated by fallback)

## Future-Proofing Notes

**For 5-10+ modes**:
- Mode discovery via directory scan: `ls test-samples/canonical/tiny-qs | grep '^output-'`
- Mode registry: JSON file mapping mode → command + metadata
- Generated justfile recipes: Avoid 120+ hardcoded recipes

**Backward compatibility**:
- Keep dual filename check (output.js / deobfuscated.js)
- Existing scripts continue to work
- Additive changes only
