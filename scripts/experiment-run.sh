#!/bin/bash
# Wrapper for the new Unified Experiment Runner
# Preserves the interface of the old script but uses the new system.

# Usage: ./scripts/experiment-run.sh <variant> [sample] [preset]

VARIANT="${1:-}"
SAMPLE="${2:-all}"
PRESET="${3:-fast}"

if [ -z "$VARIANT" ]; then
  echo "Usage: $0 <variant> [sample] [preset]"
  exit 1
fi

echo "Forwarding to Unified Runner..."
npx tsx scripts/run-experiment-unified.ts "$VARIANT" "$SAMPLE" "$PRESET"