#!/usr/bin/env bash
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
echo "Semantic Scoring on All Baselines (Parallel)"
echo "==================================================="
echo ""

# Function to run scoring and save results (runs in background)
score_baseline() {
  local sample=$1
  local mode=$2
  local original="test-samples/canonical/$sample/original.js"
  local output_dir="test-samples/canonical/$sample/output-$mode"
  local score_file="$output_dir/semantic-score.json"
  local log_file="/tmp/score-output-$sample-$mode.txt"

  # Check for output.js first (preferred), then deobfuscated.js (legacy)
  local output="$output_dir/output.js"
  if [ ! -f "$output" ]; then
    output="$output_dir/deobfuscated.js"
  fi

  if [ ! -f "$output" ]; then
    echo "[SKIP] $sample/$mode - output file not found"
    return 1
  fi

  echo "[START] $sample/$mode"

  # Run scoring and capture full output
  npx tsx scripts/score-semantic.ts "$original" "$output" > "$log_file" 2>&1

  # Extract JSON from output (everything after "JSON Output:")
  sed -n '/^JSON Output:/,/^$/p' "$log_file" | tail -n +2 > "$score_file"

  # Validate JSON and show result
  if python3 -c "import json; json.load(open('$score_file'))" 2>/dev/null; then
    local score=$(python3 -c "import json; print(json.load(open('$score_file'))['score'])")
    echo "[DONE] $sample/$mode: $score/100"
  else
    echo "[ERROR] $sample/$mode - invalid JSON (see $log_file)"
    return 1
  fi
}

# Launch all scoring jobs in parallel
pids=()
for sample in tiny-qs small-axios medium-chart; do
  for mode in sequential turbo turbo-refine turbo-v2; do
    score_baseline "$sample" "$mode" &
    pids+=($!)
  done
done

echo ""
echo "Launched ${#pids[@]} scoring jobs in parallel..."
echo ""

# Wait for all jobs to complete
for pid in "${pids[@]}"; do
  wait $pid 2>/dev/null || true
done

echo ""

echo "==================================================="
echo "SCORE SUMMARY"
echo "==================================================="
echo ""
printf "%-15s %10s %10s %12s %10s\n" "Sample" "Sequential" "Turbo" "Turbo+Refine" "Turbo-V2"
printf "%-15s %10s %10s %12s %10s\n" "------" "----------" "-----" "------------" "--------"

# Helper to read score from JSON file
get_score() {
  local file=$1
  if [ -f "$file" ]; then
    python3 -c "import json; print(json.load(open('$file')).get('score', 'N/A'))" 2>/dev/null || echo "N/A"
  else
    echo "N/A"
  fi
}

for sample in tiny-qs small-axios medium-chart; do
  seq_score=$(get_score "test-samples/canonical/$sample/output-sequential/semantic-score.json")
  turbo_score=$(get_score "test-samples/canonical/$sample/output-turbo/semantic-score.json")
  refine_score=$(get_score "test-samples/canonical/$sample/output-turbo-refine/semantic-score.json")
  v2_score=$(get_score "test-samples/canonical/$sample/output-turbo-v2/semantic-score.json")
  printf "%-15s %10s %10s %12s %10s\n" "$sample" "$seq_score" "$turbo_score" "$refine_score" "$v2_score"
done
echo ""
echo "==================================================="
echo ""
echo "Results saved to:"
echo "  - test-samples/canonical/*/output-sequential/semantic-score.json"
echo "  - test-samples/canonical/*/output-turbo/semantic-score.json"
echo "  - test-samples/canonical/*/output-turbo-refine/semantic-score.json"
echo "  - test-samples/canonical/*/output-turbo-v2/semantic-score.json"
echo ""
echo "Next steps:"
echo "  python3 scripts/analyze-validation-results.py"
