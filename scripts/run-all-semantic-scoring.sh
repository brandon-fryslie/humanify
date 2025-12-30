#!/bin/bash
# Run semantic scoring on all baselines
# Sprint 1 Deliverable D1.1

set -e

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SAMPLES_DIR="$PROJECT_ROOT/test-samples/canonical"

echo "==================================================="
echo "Sprint 1 D1.1: Semantic Scoring on All Baselines"
echo "==================================================="
echo ""

# Function to run scoring and save results
score_baseline() {
  local sample=$1
  local mode=$2
  local original="$SAMPLES_DIR/$sample/original.js"
  local output="$SAMPLES_DIR/$sample/output-$mode/deobfuscated.js"
  local score_file="$SAMPLES_DIR/$sample/output-$mode/semantic-score.json"

  echo "---------------------------------------------------"
  echo "Scoring: $sample / $mode"
  echo "---------------------------------------------------"

  if [ ! -f "$output" ]; then
    echo "ERROR: Output file not found: $output"
    echo "Skipping..."
    return 1
  fi

  echo "Running semantic scoring..."
  npx tsx "$SCRIPT_DIR/score-semantic.ts" "$original" "$output" > /tmp/score-output.txt

  # Extract JSON from output
  cat /tmp/score-output.txt | grep -A 100 "JSON Output:" | tail -n +2 > "$score_file"

  # Show score
  local score=$(cat "$score_file" | grep '"score"' | head -1 | sed 's/.*: //' | sed 's/,//')
  echo "Score: $score/100"
  echo "Saved to: $score_file"
  echo ""
}

# Run scoring for all samples and modes
for sample in tiny-qs small-axios medium-chart; do
  for mode in sequential turbo; do
    score_baseline "$sample" "$mode" || true
  done
done

echo "==================================================="
echo "Semantic Scoring Complete"
echo "==================================================="
echo ""
echo "Results saved to:"
echo "  - test-samples/canonical/*/output-sequential/semantic-score.json"
echo "  - test-samples/canonical/*/output-turbo/semantic-score.json"
echo ""
echo "Next steps:"
echo "  1. Review scores in each semantic-score.json file"
echo "  2. Run analysis script to generate VALIDATION-RESULTS.md"
