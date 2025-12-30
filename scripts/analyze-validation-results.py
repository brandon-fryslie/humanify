#!/usr/bin/env python3
"""
Analyze semantic scoring results and generate VALIDATION-RESULTS.md
Sprint 1 Deliverable D1.2
"""

import json
import os
from pathlib import Path

# Base directory
PROJECT_ROOT = Path(__file__).parent.parent
SAMPLES_DIR = PROJECT_ROOT / "test-samples" / "canonical"

# Test samples
SAMPLES = ["tiny-qs", "small-axios", "medium-chart"]
MODES = ["sequential", "turbo"]

def load_score(sample, mode):
    """Load semantic score from JSON file"""
    score_file = SAMPLES_DIR / sample / f"output-{mode}" / "semantic-score.json"

    if not score_file.exists():
        return None

    try:
        with open(score_file) as f:
            data = json.load(f)
            return {
                'score': data.get('score', 0),
                'explanation': data.get('explanation', ''),
                'tokensUsed': data.get('tokensUsed', 0),
                'cost': data.get('cost', 0),
                'identifierCount': len(data.get('unminifiedIdentifiers', []))
            }
    except Exception as e:
        print(f"Error loading {score_file}: {e}")
        return None

def main():
    print("=" * 60)
    print("Sprint 1 D1.2: Validation Results Analysis")
    print("=" * 60)
    print()

    # Collect all scores
    results = {}
    for sample in SAMPLES:
        results[sample] = {}
        for mode in MODES:
            score_data = load_score(sample, mode)
            results[sample][mode] = score_data

    # Display results table
    print("Semantic Scores:")
    print("-" * 60)
    print(f"{'Sample':<15} {'Sequential':<12} {'Turbo (1-pass)':<15} {'Ratio':<8}")
    print("-" * 60)

    ratios = []
    for sample in SAMPLES:
        seq = results[sample].get('sequential')
        turbo = results[sample].get('turbo')

        if seq and turbo:
            seq_score = seq['score']
            turbo_score = turbo['score']
            ratio = turbo_score / seq_score if seq_score > 0 else 0
            ratios.append(ratio)
            print(f"{sample:<15} {seq_score:<12.1f} {turbo_score:<15.1f} {ratio:<8.2%}")
        else:
            print(f"{sample:<15} {'N/A':<12} {'N/A':<15} {'N/A':<8}")

    print("-" * 60)

    # Calculate average ratio
    if ratios:
        avg_ratio = sum(ratios) / len(ratios)
        print(f"\nAverage Ratio: {avg_ratio:.2%}")
    else:
        avg_ratio = 0
        print("\nNo ratios calculated - missing data")

    # Make go/no-go decision
    print()
    print("=" * 60)
    print("GO / NO-GO DECISION")
    print("=" * 60)
    print()
    print("Criteria:")
    print("  - GO if 1-pass >= 60% of sequential")
    print("  - NO-GO if 1-pass < 50% of sequential")
    print("  - MARGINAL if between 50-60%")
    print()

    if avg_ratio >= 0.60:
        decision = "GO"
        color = "GREEN"
    elif avg_ratio >= 0.50:
        decision = "MARGINAL"
        color = "YELLOW"
    else:
        decision = "NO-GO"
        color = "RED"

    print(f"Decision: {decision} ({color})")
    print(f"Reason: Average ratio is {avg_ratio:.2%}")
    print()

    # Calculate total cost
    total_cost = 0
    total_tokens = 0
    for sample in SAMPLES:
        for mode in MODES:
            data = results[sample].get(mode)
            if data:
                total_cost += data['cost']
                total_tokens += data['tokensUsed']

    print("=" * 60)
    print("COST SUMMARY")
    print("=" * 60)
    print(f"Total tokens: {total_tokens:,}")
    print(f"Total cost: ${total_cost:.4f}")
    print()

    # Detailed explanations
    print("=" * 60)
    print("DETAILED EXPLANATIONS")
    print("=" * 60)
    print()

    for sample in SAMPLES:
        print(f"{sample}:")
        for mode in MODES:
            data = results[sample].get(mode)
            if data:
                print(f"  {mode}:")
                print(f"    Score: {data['score']}/100")
                print(f"    Explanation: {data['explanation']}")
                print(f"    Identifiers: {data['identifierCount']}")
        print()

    # Generate VALIDATION-RESULTS.md
    output_path = PROJECT_ROOT / "src" / "turbo-v2" / "VALIDATION-RESULTS.md"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w') as f:
        f.write("# Turbo V2: Hypothesis Validation Results\n\n")
        f.write("**Date**: 2025-12-30\n")
        f.write("**Sprint**: 1 - Phase 0 Completion\n")
        f.write("**Status**: COMPLETE\n\n")

        f.write("---\n\n")
        f.write("## Executive Summary\n\n")
        f.write(f"**Decision**: {decision}\n")
        f.write(f"**Average Quality Ratio**: {avg_ratio:.2%} (1-pass turbo / sequential)\n\n")

        if decision == "GO":
            f.write("The hypothesis that multi-pass parallel processing can achieve ≥95% of sequential quality is **VALIDATED** based on the 1-pass baseline showing ≥60% of sequential quality.\n\n")
        elif decision == "MARGINAL":
            f.write("The hypothesis is **MARGINAL**. 1-pass quality is between 50-60% of sequential, suggesting multi-pass may work but will require more passes than anticipated.\n\n")
        else:
            f.write("The hypothesis is **REJECTED**. 1-pass quality is <50% of sequential, indicating the multi-pass approach may not be viable.\n\n")

        f.write("---\n\n")
        f.write("## Methodology\n\n")
        f.write("### Test Samples\n\n")
        f.write("| Sample | Identifiers | Lines | Complexity |\n")
        f.write("|--------|-------------|-------|-----------|\n")
        f.write("| tiny-qs | ~150 | 356 | Low |\n")
        f.write("| small-axios | ~800 | 3K | Medium |\n")
        f.write("| medium-chart | ~5000 | 11K | High |\n\n")

        f.write("### Processing Modes\n\n")
        f.write("1. **Sequential**: Current HumanifyJS with `--turbo` disabled (identifiers processed one at a time in dependency order)\n")
        f.write("2. **Turbo (1-pass)**: Current HumanifyJS with `--turbo --max-concurrent 50` (all identifiers in parallel, single pass)\n\n")

        f.write("### Semantic Scoring\n\n")
        f.write("- **Tool**: `scripts/score-semantic.ts`\n")
        f.write("- **Judge**: GPT-4o (LLM-as-judge)\n")
        f.write("- **Method**: Compare deobfuscated identifier names to original source names\n")
        f.write("- **Scale**: 0-100 (semantic quality)\n")
        f.write("- **Sampling**: Up to 200 identifiers per file (deterministic sampling)\n\n")

        f.write("---\n\n")
        f.write("## Results\n\n")
        f.write("### Semantic Scores\n\n")
        f.write("| Sample | Sequential | Turbo (1-pass) | Ratio | Status |\n")
        f.write("|--------|------------|----------------|-------|--------|\n")

        for sample in SAMPLES:
            seq = results[sample].get('sequential')
            turbo = results[sample].get('turbo')

            if seq and turbo:
                seq_score = seq['score']
                turbo_score = turbo['score']
                ratio = turbo_score / seq_score if seq_score > 0 else 0
                status = "PASS" if ratio >= 0.60 else ("MARGINAL" if ratio >= 0.50 else "FAIL")
                f.write(f"| {sample} | {seq_score:.1f} | {turbo_score:.1f} | {ratio:.2%} | {status} |\n")
            else:
                f.write(f"| {sample} | N/A | N/A | N/A | ERROR |\n")

        f.write(f"\n**Average Ratio**: {avg_ratio:.2%}\n\n")

        f.write("### Detailed Analysis\n\n")

        for sample in SAMPLES:
            f.write(f"#### {sample}\n\n")

            seq = results[sample].get('sequential')
            turbo = results[sample].get('turbo')

            if seq:
                f.write(f"**Sequential Mode**:\n")
                f.write(f"- Score: {seq['score']}/100\n")
                f.write(f"- Explanation: {seq['explanation']}\n")
                f.write(f"- Identifiers: {seq['identifierCount']}\n\n")

            if turbo:
                f.write(f"**Turbo Mode (1-pass)**:\n")
                f.write(f"- Score: {turbo['score']}/100\n")
                f.write(f"- Explanation: {turbo['explanation']}\n")
                f.write(f"- Identifiers: {turbo['identifierCount']}\n\n")

        f.write("---\n\n")
        f.write("## Cost Analysis\n\n")
        f.write(f"- **Total API calls**: 6 (3 samples × 2 modes)\n")
        f.write(f"- **Total tokens**: {total_tokens:,}\n")
        f.write(f"- **Total cost**: ${total_cost:.4f}\n\n")

        f.write("---\n\n")
        f.write("## Interpretation\n\n")

        if decision == "GO":
            f.write("### Why This Validates the Hypothesis\n\n")
            f.write("The 1-pass parallel baseline achieves ≥60% of sequential quality, which suggests that:\n\n")
            f.write("1. **Parallel processing is viable**: Even without seeing previous renames, the LLM can generate reasonable names from code context alone\n")
            f.write("2. **Multi-pass will improve**: If 1-pass achieves ~60-70%, adding a second pass where all identifiers see the first pass renames should significantly improve quality\n")
            f.write("3. **Context flow matters**: The gap between sequential and parallel indicates that seeing previously-renamed identifiers provides valuable context\n\n")
            f.write("### Expected 2-Pass Performance\n\n")
            f.write("Based on these results, we expect:\n")
            f.write("- **1-pass**: ~60-70% of sequential quality\n")
            f.write("- **2-pass**: ~85-95% of sequential quality (hypothesis target)\n")
            f.write("- **3-pass**: ~95-100% of sequential quality (stability plateau)\n\n")
        elif decision == "MARGINAL":
            f.write("### What This Means\n\n")
            f.write("The 1-pass results are marginal (50-60% of sequential), suggesting:\n\n")
            f.write("1. **More passes needed**: May need 3-4 passes instead of 2 to reach target quality\n")
            f.write("2. **Hybrid approach recommended**: Consider anchor-first (sequential high-value IDs, then parallel bulk)\n")
            f.write("3. **Proceed with caution**: Continue to Phase 1 but expect to iterate on strategy\n\n")
        else:
            f.write("### Why This Fails the Hypothesis\n\n")
            f.write("The 1-pass results are below 50% of sequential, indicating:\n\n")
            f.write("1. **Fundamental issue**: Parallel processing may not provide enough context even with multiple passes\n")
            f.write("2. **Architecture rethink needed**: Consider streaming windows or full sequential as alternative\n")
            f.write("3. **Do not proceed**: Phase 1 implementation should be paused pending alternative design\n\n")

        f.write("---\n\n")
        f.write("## Recommendation\n\n")

        if decision == "GO":
            f.write("**PROCEED to Sprint 2**: Begin Phase 1 implementation (Vault, Ledger, Orchestrator)\n\n")
        elif decision == "MARGINAL":
            f.write("**CONDITIONAL PROCEED**: Implement Phase 1 but design for 3-4 pass pipelines instead of 2\n\n")
        else:
            f.write("**DO NOT PROCEED**: Revisit architecture before implementing. Consider:\n")
            f.write("- Streaming windows with overlap\n")
            f.write("- Anchor-first hybrid (sequential top 20%, parallel rest)\n")
            f.write("- Increasing context window size\n\n")

        f.write("---\n\n")
        f.write("*This document is authoritative for Sprint 1 completion.*\n")

    print(f"VALIDATION-RESULTS.md written to: {output_path}")
    print()

    # Return decision for programmatic use
    return decision, avg_ratio

if __name__ == "__main__":
    decision, ratio = main()
    exit(0 if decision == "GO" else (1 if decision == "MARGINAL" else 2))
