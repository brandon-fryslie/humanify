#!/bin/bash
# Run humanify in TURBO mode on a canonical sample
# Usage: ./scripts/run-turbo.sh <sample-name> [max-concurrent]
# Example: ./scripts/run-turbo.sh tiny-qs 10

set -e

SAMPLE="${1:-}"
MAX_CONCURRENT="${2:-10}"

if [ -z "$SAMPLE" ]; then
  echo "Usage: $0 <sample-name> [max-concurrent]"
  echo "Available samples: tiny-qs, small-axios, medium-chart"
  echo "Default max-concurrent: 10"
  exit 1
fi

SAMPLE_DIR="test-samples/canonical/$SAMPLE"
if [ ! -d "$SAMPLE_DIR" ]; then
  echo "Error: Sample directory not found: $SAMPLE_DIR"
  exit 1
fi

# Load API key
if [ -f ~/.rad-aik ]; then
  export OPENAI_API_KEY=$(cat ~/.rad-aik | base64 -d)
elif [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY not set and ~/.rad-aik not found"
  exit 1
fi

OUTPUT_DIR="$SAMPLE_DIR/output-turbo"
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "Running TURBO mode on: $SAMPLE"
echo "Max concurrent: $MAX_CONCURRENT"
echo "Output: $OUTPUT_DIR"
echo "=========================================="

time node dist/index.mjs unminify \
  --provider openai \
  --no-chunking \
  --turbo \
  --max-concurrent "$MAX_CONCURRENT" \
  -o "$OUTPUT_DIR" \
  "$SAMPLE_DIR/minified.js"

echo ""
echo "Done! Output in: $OUTPUT_DIR/deobfuscated.js"
