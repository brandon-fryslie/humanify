# Eval Cache Index

This directory contains reusable evaluation knowledge extracted from project-evaluator runs.

## Purpose

Cache stable, reusable findings to avoid re-discovering the same information in future evaluations.

## What to Cache

- Project structure, architecture patterns
- Test infrastructure (how to run tests, test frameworks)
- Build/deployment processes
- Code conventions, naming patterns
- API patterns, common abstractions
- Infrastructure components (databases, message queues, etc.)

## What NOT to Cache

- Specific bug findings (ephemeral, put in STATUS/EVAL files)
- Test pass/fail results (re-run to verify)
- Completion verdicts (COMPLETE/INCOMPLETE - point-in-time)
- Work-in-progress implementation details

## Cache Files

| Topic | File | Cached | Source | Confidence |
|-------|------|--------|--------|------------|
| Scoring Infrastructure | scoring-infrastructure.md | 2025-12-31 00:24 | project-evaluator | HIGH |

## Usage

1. **Before evaluation**: Check cache for relevant knowledge
2. **During evaluation**: Reference cached files for context
3. **After evaluation**: Extract new reusable findings to cache
4. **Update INDEX.md**: Document what was cached and when

## Freshness Guidelines

- **< 7 days**: FRESH - Use directly
- **7-30 days**: RECENT - Spot-check critical claims
- **> 30 days**: STALE - Re-validate before relying

Files in this cache are considered HIGH confidence until architectural changes invalidate them.
