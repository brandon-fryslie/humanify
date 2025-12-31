#!/bin/bash
# Run humanify in TURBO-V2 mode on a canonical sample
# Usage: ./scripts/run-turbo-v2.sh <sample-name> [preset]
# Example: ./scripts/run-turbo-v2.sh tiny-qs fast
# Example: ./scripts/run-turbo-v2.sh small-axios balanced

set -e

SAMPLE="${1:-}"
PRESET="${2:-fast}"

if [ -z "$SAMPLE" ]; then
  echo "Usage: $0 <sample-name> [preset]"
  echo "Available samples: tiny-qs, small-axios, medium-chart"
  echo "Available presets: fast (default), balanced, quality, anchor"
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
elif [ -f .env ]; then
  export OPENAI_API_KEY=$(grep OPENAI_API_KEY .env | cut -d '=' -f2 | tr -d '"')
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY not set"
  exit 1
fi

OUTPUT_DIR="$SAMPLE_DIR/output-turbo-v2"
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "Running TURBO-V2 mode on: $SAMPLE"
echo "Preset: $PRESET"
echo "Output: $OUTPUT_DIR"
echo "=========================================="

time node dist/index.mjs unminify \
  --provider openai \
  --no-chunking \
  --turbo-v2 \
  --preset "$PRESET" \
  -o "$OUTPUT_DIR" \
  "$SAMPLE_DIR/minified.js"

echo ""
echo "Done! Output in: $OUTPUT_DIR/deobfuscated.js"
