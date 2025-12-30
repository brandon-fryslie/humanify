#!/bin/bash
# Score a deobfuscated sample against the original using semantic LLM scoring
# Usage: ./scripts/score-sample.sh <sample-name> <mode>
# Example: ./scripts/score-sample.sh tiny-qs sequential
# Example: ./scripts/score-sample.sh tiny-qs turbo

set -e

SAMPLE="${1:-}"
MODE="${2:-}"

if [ -z "$SAMPLE" ] || [ -z "$MODE" ]; then
  echo "Usage: $0 <sample-name> <mode>"
  echo "Available samples: tiny-qs, small-axios, medium-chart"
  echo "Available modes: sequential, turbo"
  exit 1
fi

SAMPLE_DIR="test-samples/canonical/$SAMPLE"
ORIGINAL="$SAMPLE_DIR/original.js"
UNMINIFIED="$SAMPLE_DIR/output-$MODE/deobfuscated.js"

if [ ! -f "$ORIGINAL" ]; then
  echo "Error: Original file not found: $ORIGINAL"
  exit 1
fi

if [ ! -f "$UNMINIFIED" ]; then
  echo "Error: Unminified file not found: $UNMINIFIED"
  echo "Run ./scripts/run-$MODE.sh $SAMPLE first"
  exit 1
fi

# Load API key
if [ -f ~/.rad-aik ]; then
  export OPENAI_API_KEY=$(cat ~/.rad-aik | base64 -d)
elif [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY not set and ~/.rad-aik not found"
  exit 1
fi

echo "=========================================="
echo "Scoring: $SAMPLE ($MODE mode)"
echo "=========================================="

npx tsx scripts/score-semantic.ts "$ORIGINAL" "$UNMINIFIED"
