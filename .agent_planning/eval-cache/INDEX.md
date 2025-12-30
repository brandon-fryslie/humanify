# Evaluation Cache Index

This directory caches stable, reusable findings from project evaluations to avoid re-analyzing the same aspects across multiple evaluation runs.

## Cache Status

| Topic | File | Cached | Source | Confidence |
|-------|------|--------|--------|------------|
| Validation Infrastructure | validation-infrastructure.md | 2024-12-29 23:45 | project-evaluator | HIGH |

## Recently Invalidated

| Topic | File | Invalidated | Reason |
|-------|------|-------------|--------|
| Turbo V2 Architecture | turbo-v2-architecture.md | 2025-12-30 | Sprint 3 completed - Ledger implemented |

## Cache Guidelines

**Cache these** (stable knowledge):
- Project structure and organization
- Architecture patterns and design decisions
- Test infrastructure and frameworks
- Build and deployment processes
- Code conventions and patterns

**Don't cache** (ephemeral):
- Specific bug findings
- Verdicts (COMPLETE/INCOMPLETE)
- Test pass/fail results
- Performance measurements
- Timestamps and point-in-time status

## Invalidation

Cache entries should be invalidated when:
- Core architecture files change significantly
- Dependencies or framework versions change
- Major refactoring occurs

Each cache file includes a "Last Validated" timestamp.
