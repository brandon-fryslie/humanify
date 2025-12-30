#!/bin/bash
# Run semantic scoring on all baselines - Fixed version
# Sprint 1 Deliverable D1.1

set -e

# Change to project root
cd "$(dirname "$0")/.."

# Export API key from .env
export OPENAI_API_KEY=$(grep OPENAI_API_KEY .env | cut -d '=' -f2 | tr -d '"')

if [ -z "$OPENAI_API_KEY" ]; then
  echo "ERROR: OPENAI_API_KEY not found in .env"
  exit 1
fi

echo "==================================================="
echo "Sprint 1 D1.1: Semantic Scoring on All Baselines"
echo "==================================================="
echo ""

# Function to run scoring and save results
score_baseline() {
  local sample=$1
  local mode=$2
  local original="test-samples/canonical/$sample/original.js"
  local output="test-samples/canonical/$sample/output-$mode/deobfuscated.js"
  local score_file="test-samples/canonical/$sample/output-$mode/semantic-score.json"

  echo "---------------------------------------------------"
  echo "Scoring: $sample / $mode"
  echo "---------------------------------------------------"

  if [ ! -f "$output" ]; then
    echo "ERROR: Output file not found: $output"
    echo "Skipping..."
    return 1
  fi

  echo "Running semantic scoring..."

  # Run scoring and capture full output
  npx tsx scripts/score-semantic.ts "$original" "$output" > /tmp/score-output-$sample-$mode.txt 2>&1

  # Extract JSON from output (everything after "JSON Output:")
  sed -n '/^JSON Output:/,/^$/p' /tmp/score-output-$sample-$mode.txt | tail -n +2 > "$score_file"

  # Validate JSON
  if ! python3 -c "import json; json.load(open('$score_file'))" 2>/dev/null; then
    echo "ERROR: Invalid JSON generated"
    echo "Full output saved to /tmp/score-output-$sample-$mode.txt"
    return 1
  fi

  # Show score
  local score=$(python3 -c "import json; print(json.load(open('$score_file'))['score'])")
  echo "Score: $score/100"
  echo "Saved to: $score_file"
  echo ""
}

# Run scoring for all samples and modes
for sample in tiny-qs small-axios medium-chart; do
  for mode in sequential turbo; do
    score_baseline "$sample" "$mode" || echo "Failed to score $sample/$mode"
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
echo "  python3 scripts/analyze-validation-results.py"
