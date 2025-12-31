#!/usr/bin/env bash
# Run a turbo-v2 experiment with a named variant
#
# Usage: ./scripts/experiment-run.sh <variant> [sample] [preset]
#
# Examples:
#   ./scripts/experiment-run.sh baseline              # Run all samples with 'fast' preset
#   ./scripts/experiment-run.sh multi-prompt tiny-qs  # Run just tiny-qs
#   ./scripts/experiment-run.sh adaptive all thorough # Run all with 'thorough' preset
#
# Output goes to: test-samples/canonical/{sample}/output-turbo-v2-{variant}/

set -e

VARIANT="${1:-}"
SAMPLE="${2:-all}"
PRESET="${3:-fast}"

if [ -z "$VARIANT" ]; then
  echo "Usage: $0 <variant> [sample] [preset]"
  echo ""
  echo "Arguments:"
  echo "  variant  - Name for this experiment (e.g., 'baseline', 'multi-prompt', 'adaptive')"
  echo "  sample   - Sample to run: tiny-qs, small-axios, medium-chart, or 'all' (default: all)"
  echo "  preset   - Preset to use: fast, balanced, thorough, quality, anchor (default: fast)"
  echo ""
  echo "Examples:"
  echo "  $0 baseline                    # Run all samples with 'fast' preset"
  echo "  $0 multi-prompt tiny-qs        # Run just tiny-qs with 'fast'"
  echo "  $0 adaptive all thorough       # Run all samples with 'thorough' preset"
  echo ""
  echo "Output: test-samples/canonical/{sample}/output-turbo-v2-{variant}/"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Samples to process
if [ "$SAMPLE" = "all" ]; then
  SAMPLES="tiny-qs small-axios medium-chart"
else
  SAMPLES="$SAMPLE"
fi

echo "=============================================="
echo "EXPERIMENT: $VARIANT"
echo "=============================================="
echo "Samples: $SAMPLES"
echo "Preset: $PRESET"
echo "Started: $(date)"
echo ""

# Track timing
START_TIME=$(date +%s)

for sample in $SAMPLES; do
  SAMPLE_DIR="$PROJECT_ROOT/test-samples/canonical/$sample"
  OUTPUT_DIR="$SAMPLE_DIR/output-turbo-v2-$VARIANT"

  echo "----------------------------------------------"
  echo "Processing: $sample → output-turbo-v2-$VARIANT"
  echo "----------------------------------------------"

  # Clean previous output
  rm -rf "$OUTPUT_DIR"
  mkdir -p "$OUTPUT_DIR"

  # Run turbo-v2
  node "$PROJECT_ROOT/dist/index.mjs" unminify \
    --provider openai \
    --turbo-v2 \
    --preset "$PRESET" \
    --no-chunking \
    -o "$OUTPUT_DIR" \
    "$SAMPLE_DIR/minified.js"

  echo "✓ $sample complete → $OUTPUT_DIR/output.js"
  echo ""
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "=============================================="
echo "EXPERIMENT COMPLETE: $VARIANT"
echo "=============================================="
echo "Duration: ${DURATION}s"
echo "Output directories:"
for sample in $SAMPLES; do
  echo "  - test-samples/canonical/$sample/output-turbo-v2-$VARIANT/"
done
echo ""
echo "To score: just experiment-score $VARIANT"
echo "To compare: just experiment-compare"
