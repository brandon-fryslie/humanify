# Humanify Justfile - Common commands for testing and development

# Default recipe - show available commands
default:
    @just --list

# Build the project
build:
    npm run build

# Run tests
test:
    npm test

# Process TensorFlow.js test file (1.4MB, ~35K identifiers)
test-tensorflow:
    node --max-old-space-size=4096 ./dist/index.mjs unminify --provider openai test-samples/tensorflow.min.js \
        --turbo \
        --max-concurrent 20 \
        --min-batch-size 10 \
        --max-batch-size 80 \
        --context-size 40000 \
        --dependency-mode balanced \
        --max-memory 2048 \
        -o "output/tensorflow-humanified"

# Dry-run on TensorFlow.js to estimate cost/time
test-tensorflow-dry:
    ./dist/index.mjs unminify --provider openai test-samples/tensorflow.min.js \
        --turbo \
        --max-concurrent 20 \
        --context-size 40000 \
        --dependency-mode balanced \
        --dry-run

# Process Babylon.js test file (7.2MB, ~82K identifiers - LARGE!)
test-babylon:
    node --max-old-space-size=8192 ./dist/index.mjs unminify --provider openai test-samples/babylon.min.js \
        --turbo \
        --max-concurrent 30 \
        --min-batch-size 10 \
        --max-batch-size 100 \
        --context-size 50000 \
        --dependency-mode relaxed \
        --max-memory 4096 \
        -o "output/babylon-humanified"

# Process large file (9.4MB deobfuscated.js)
test-large:
    node --max-old-space-size=20480 ./dist/index.mjs unminify --provider openai "output/webcrack-test/deobfuscated.js" \
        --turbo \
        --max-concurrent 30 \
        --min-batch-size 15 \
        --max-batch-size 100 \
        --context-size 75000 \
        --dependency-mode relaxed \
        --max-memory 16384 \
        --refine \
        -o "output/claude-code-cli-humanified"

# Quick test on small sample
test-small:
    ./dist/index.mjs unminify --provider openai test-samples/tensorflow.min.js \
        --turbo \
        --max-concurrent 10 \
        --context-size 30000 \
        --dependency-mode balanced \
        -o "output/quick-test"

# Download TensorFlow.js test sample (1.4MB)
download-tensorflow:
    mkdir -p test-samples
    curl -o test-samples/tensorflow.min.js https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js
    @echo "Downloaded TensorFlow.js ($(du -h test-samples/tensorflow.min.js | cut -f1))"

# Download Babylon.js test sample (7.2MB)
download-babylon:
    mkdir -p test-samples
    curl -o test-samples/babylon.min.js https://cdn.babylonjs.com/babylon.js
    @echo "Downloaded Babylon.js ($(du -h test-samples/babylon.min.js | cut -f1))"

# Clean output directories{
clean:
    rm -rf output/tensorflow-humanified
    rm -rf output/babylon-humanified
    rm -rf output/claude-code-cli-humanified
    rm -rf output/quick-test

# Show file stats for test samples
stats:
    @echo "Test sample files:"
    @[ -f test-samples/tensorflow.min.js ] && echo "  tensorflow.min.js: $(du -h test-samples/tensorflow.min.js | cut -f1)" || echo "  tensorflow.min.js: not found"
    @[ -f test-samples/babylon.min.js ] && echo "  babylon.min.js: $(du -h test-samples/babylon.min.js | cut -f1)" || echo "  babylon.min.js: not found"
    @[ -f output/webcrack-test/deobfuscated.js ] && echo "  deobfuscated.js: $(du -h output/webcrack-test/deobfuscated.js | cut -f1)" || echo "  deobfuscated.js: not found"

# Process claude-code-cli.js (9.4MB) with optimized chunking settings
# Requires OPENAI_API_KEY environment variable to be set
claude:
    npm run build
    @if [ -z "$$OPENAI_API_KEY" ]; then echo "Error: OPENAI_API_KEY environment variable not set"; exit 1; fi
    node dist/index.mjs unminify --provider openai test-samples/claude.js --turbo --refine --max-concurrent 25 --chunk-size 300000 -o "output/claude-$(date +"%Y-%m-%dT%H:%M:%S")"

# ========================================
# Canonical Sample Processing
# ========================================

# Run a sample in sequential mode (no turbo)
# Usage: just run-seq <sample>
# Example: just run-seq tiny-qs
run-seq sample:
    ./scripts/run-sequential.sh {{sample}}

# Run a sample in turbo mode
# Usage: just run-turbo <sample> [max-concurrent]
# Example: just run-turbo tiny-qs 10
run-turbo sample concurrency="10":
    ./scripts/run-turbo.sh {{sample}} {{concurrency}}

# Run a sample in turbo-v2 mode (new multi-pass parallel)
# Usage: just run-turbo-v2 <sample> [preset]
# Example: just run-turbo-v2 tiny-qs fast
run-turbo-v2 sample preset="fast":
    ./scripts/run-turbo-v2.sh {{sample}} {{preset}}

# Run tiny-qs sample (sequential)
run-tiny-qs-seq:
    ./scripts/run-sequential.sh tiny-qs

# Run tiny-qs sample (turbo)
run-tiny-qs-turbo concurrency="10":
    ./scripts/run-turbo.sh tiny-qs {{concurrency}}

# Run tiny-qs sample (turbo-v2)
run-tiny-qs-turbo-v2 preset="fast":
    ./scripts/run-turbo-v2.sh tiny-qs {{preset}}

# Run small-axios sample (sequential)
run-small-axios-seq:
    ./scripts/run-sequential.sh small-axios

# Run small-axios sample (turbo)
run-small-axios-turbo concurrency="10":
    ./scripts/run-turbo.sh small-axios {{concurrency}}

# Run small-axios sample (turbo-v2)
run-small-axios-turbo-v2 preset="fast":
    ./scripts/run-turbo-v2.sh small-axios {{preset}}

# Run medium-chart sample (sequential)
run-medium-chart-seq:
    ./scripts/run-sequential.sh medium-chart

# Run medium-chart sample (turbo)
run-medium-chart-turbo concurrency="15":
    ./scripts/run-turbo.sh medium-chart {{concurrency}}

# Run medium-chart sample (turbo-v2)
run-medium-chart-turbo-v2 preset="fast":
    ./scripts/run-turbo-v2.sh medium-chart {{preset}}

# Run all samples in sequential mode
run-all-seq:
    @echo "Running all samples in sequential mode..."
    ./scripts/run-sequential.sh tiny-qs
    ./scripts/run-sequential.sh small-axios
    ./scripts/run-sequential.sh medium-chart

# Run all samples in turbo mode
run-all-turbo:
    @echo "Running all samples in turbo mode..."
    ./scripts/run-turbo.sh tiny-qs 10
    ./scripts/run-turbo.sh small-axios 10
    ./scripts/run-turbo.sh medium-chart 15

# Run all samples in turbo-v2 mode
run-all-turbo-v2 preset="fast":
    @echo "Running all samples in turbo-v2 mode (preset: {{preset}})..."
    ./scripts/run-turbo-v2.sh tiny-qs {{preset}}
    ./scripts/run-turbo-v2.sh small-axios {{preset}}
    ./scripts/run-turbo-v2.sh medium-chart {{preset}}

# Run a sample in turbo mode WITH refinement (2nd pass)
# Usage: just run-turbo-refine <sample> [max-concurrent]
run-turbo-refine sample concurrency="10":
    #!/bin/bash
    set -e
    SAMPLE_DIR="test-samples/canonical/{{sample}}"
    OUTPUT_DIR="$SAMPLE_DIR/output-turbo-refine"
    rm -rf "$OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
    echo "Running TURBO+REFINE on {{sample}} (concurrency={{concurrency}})..."
    node dist/index.mjs unminify \
      --provider openai \
      --no-chunking \
      --turbo \
      --refine \
      --max-concurrent {{concurrency}} \
      -o "$OUTPUT_DIR" \
      "$SAMPLE_DIR/minified.js"
    echo "Done! Output in: $OUTPUT_DIR/deobfuscated.js"

# Run tiny-qs with turbo+refine
run-tiny-qs-turbo-refine concurrency="10":
    just run-turbo-refine tiny-qs {{concurrency}}

# Run small-axios with turbo+refine
run-small-axios-turbo-refine concurrency="10":
    just run-turbo-refine small-axios {{concurrency}}

# Run medium-chart with turbo+refine
run-medium-chart-turbo-refine concurrency="15":
    just run-turbo-refine medium-chart {{concurrency}}

# ========================================
# Scoring Commands
# ========================================

# Score a deobfuscated sample against the original (LLM-as-judge)
# Usage: just score <sample> <mode>
# Example: just score tiny-qs turbo
score sample mode:
    ./scripts/score-sample.sh {{sample}} {{mode}}

# Score semantic similarity between two files directly
# Usage: just score-files <original.js> <unminified.js>
score-files original unminified:
    npx tsx scripts/score-semantic.ts {{original}} {{unminified}}

# Score tiny-qs sample (sequential mode)
score-tiny-qs-seq:
    ./scripts/score-sample.sh tiny-qs sequential

# Score tiny-qs sample (turbo mode)
score-tiny-qs-turbo:
    ./scripts/score-sample.sh tiny-qs turbo

# Score small-axios sample (sequential mode)
score-small-axios-seq:
    ./scripts/score-sample.sh small-axios sequential

# Score small-axios sample (turbo mode)
score-small-axios-turbo:
    ./scripts/score-sample.sh small-axios turbo

# Score medium-chart sample (sequential mode)
score-medium-chart-seq:
    ./scripts/score-sample.sh medium-chart sequential

# Score medium-chart sample (turbo mode)
score-medium-chart-turbo:
    ./scripts/score-sample.sh medium-chart turbo

# Score turbo-refine output
score-turbo-refine sample:
    npx tsx scripts/score-semantic.ts \
      "test-samples/canonical/{{sample}}/original.js" \
      "test-samples/canonical/{{sample}}/output-turbo-refine/deobfuscated.js"

# Score turbo-v2 output
score-turbo-v2 sample:
    npx tsx scripts/score-semantic.ts \
      "test-samples/canonical/{{sample}}/original.js" \
      "test-samples/canonical/{{sample}}/output-turbo-v2/deobfuscated.js"

# Score tiny-qs sample (turbo-v2 mode)
score-tiny-qs-turbo-v2:
    just score-turbo-v2 tiny-qs

# Score small-axios sample (turbo-v2 mode)
score-small-axios-turbo-v2:
    just score-turbo-v2 small-axios

# Score medium-chart sample (turbo-v2 mode)
score-medium-chart-turbo-v2:
    just score-turbo-v2 medium-chart

# Score all samples in all modes (with aggregated summary)
score-all:
    ./scripts/run-semantic-scoring-all.sh
