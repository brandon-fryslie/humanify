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
    node --max-old-space-size=4096 ./dist/index.mjs openai test-samples/tensorflow.min.js \
        --turbo \
        --max-concurrent 20 \
        --min-batch-size 10 \
        --max-batch-size 80 \
        --context-size 40000 \
        --dependency-mode balanced \
        --max-memory 2048 \
        --perf \
        -o "output/tensorflow-humanified"

# Dry-run on TensorFlow.js to estimate cost/time
test-tensorflow-dry:
    ./dist/index.mjs openai test-samples/tensorflow.min.js \
        --turbo \
        --max-concurrent 20 \
        --context-size 40000 \
        --dependency-mode balanced \
        --dry-run

# Process Babylon.js test file (7.2MB, ~82K identifiers - LARGE!)
test-babylon:
    node --max-old-space-size=8192 ./dist/index.mjs openai test-samples/babylon.min.js \
        --turbo \
        --max-concurrent 30 \
        --min-batch-size 10 \
        --max-batch-size 100 \
        --context-size 50000 \
        --dependency-mode relaxed \
        --max-memory 4096 \
        --perf \
        -o "output/babylon-humanified"

# Process large file (9.4MB deobfuscated.js)
test-large:
    node --max-old-space-size=20480 ./dist/index.mjs openai "output/webcrack-test/deobfuscated.js" \
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
    ./dist/index.mjs openai test-samples/tensorflow.min.js \
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
    node dist/index.mjs openai test-samples/claude-code-cli.js --turbo --max-concurrent 25 --chunk-size 300000 -o output-claude-$(date +"%Y-%m-%dT%H:%M:%S)
