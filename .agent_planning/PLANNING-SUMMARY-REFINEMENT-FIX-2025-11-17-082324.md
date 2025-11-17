# PLANNING SUMMARY: Refinement Bug Fix

**Date**: 2025-11-17 08:23:24
**Project**: HumanifyJS
**Type**: Bug Fix Plan
**Priority**: P0 - CRITICAL

---

## QUICK REFERENCE

**Full Plan**: `PLAN-REFINEMENT-FIX-2025-11-17-082324.md`
**Source STATUS**: `STATUS-2025-11-17-115400.md`
**Estimated Effort**: 5.5 hours
**Test Coverage**: 10+ new tests

---

## THE BUG

Refinement pass (`--refine` flag) **fails** because it tries to read a hardcoded file `deobfuscated.js` that **doesn't exist**.

**Reality**: Webcrack produces files like:
- `bundle_1.js`, `bundle_2.js`, ... (multi-bundle)
- `index.js` (single entry)
- Various other names

**Result**: Pass 2 crashes with "file not found" error.

---

## THE FIX (5 Phases)

### Phase 1: Add `skipWebcrack` Parameter
- Add `skipWebcrack?: boolean` to `UnminifyOptions` interface
- Skip webcrack in refinement (files already unbundled)
- **Effort**: 30 minutes

### Phase 2: Discover Output Files
- Create `discoverOutputFiles(outputDir)` helper
- Returns all `.js` files (excluding `.js.map`)
- **Effort**: 45 minutes

### Phase 3: Process Each File
- Replace hardcoded `deobfuscated.js` with file discovery
- Loop through each discovered file
- Pass `skipWebcrack: true` to unminify()
- **Effort**: 1 hour

### Phase 4: Console Output
- Clear pass headers ("Pass 2: Refining N files")
- Per-file progress indicators
- **Effort**: 30 minutes

### Phase 5: Testing
- Unit tests for file discovery (8+ tests)
- E2E test for multi-file refinement (2+ tests)
- Manual testing with real bundles
- **Effort**: 2 hours

---

## KEY CODE CHANGES

### unminify.ts (lines 16-22, 67-73)

**Add option**:
```typescript
export interface UnminifyOptions {
  // ... existing options
  skipWebcrack?: boolean;  // NEW: Skip webcrack extraction
}
```

**Conditional webcrack**:
```typescript
let extractedFiles: { path: string }[];

if (options.skipWebcrack) {
  // Refinement: use file as-is
  extractedFiles = [{ path: filename }];
} else {
  // Initial: extract with webcrack
  extractedFiles = await webcrack(bundledCode, outputDir);
}
```

### openai.ts (lines 40, 272-309)

**File discovery helper**:
```typescript
async function discoverOutputFiles(outputDir: string): Promise<string[]> {
  const entries = await fs.readdir(outputDir, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && e.name.endsWith('.js') && !e.name.endsWith('.map'))
    .map(e => path.join(outputDir, e.name))
    .sort();
}
```

**Refinement loop**:
```typescript
if (opts.refine) {
  const pass1OutputFiles = await discoverOutputFiles(opts.outputDir);

  for (const file of pass1OutputFiles) {
    await unminify(file, opts.outputDir, [...plugins], {
      ...options,
      skipWebcrack: true  // ✅ CRITICAL!
    });
  }
}
```

---

## TESTING CHECKLIST

- [ ] Unit test: discoverOutputFiles finds all .js files
- [ ] Unit test: excludes .js.map sourcemaps
- [ ] Unit test: error on non-existent directory
- [ ] Unit test: empty directory returns empty array
- [ ] E2E test: refinement with multi-file bundle
- [ ] E2E test: refinement with single-file bundle
- [ ] Manual test: TensorFlow.js with --refine
- [ ] Manual test: verify no "file not found" errors

---

## ACCEPTANCE CRITERIA

### Must Have
- ✅ Refinement discovers ALL output files from Pass 1
- ✅ Each file processed independently with skipWebcrack: true
- ✅ Clear console output for Pass 2
- ✅ All existing tests pass (223/232 current)
- ✅ No breaking changes

### Nice to Have
- ✅ Error if output directory is empty
- ✅ Sorted file processing (deterministic)
- ✅ Absolute paths returned by discovery

---

## RISKS & MITIGATIONS

| Risk | Severity | Mitigation |
|------|----------|------------|
| Break existing behavior | HIGH | Default skipWebcrack=false, all tests pass |
| Wrong files discovered | MEDIUM | Exclude .map, sort deterministically |
| Large output dirs (1000+ files) | LOW | Benchmark < 1s for 1000 files |
| Cross-file dependencies | MEDIUM | Document limitation, suggest 3+ passes |

---

## SUCCESS METRICS

**Quantitative**:
- 232/232 tests passing (100%)
- 10+ new tests added
- File discovery < 100ms for 100 files
- 0 console errors during refinement

**Qualitative**:
- User reports "Pass 2 works!"
- Console output is clear and readable
- Error messages are actionable

---

## NEXT STEPS

1. **Review this plan** - Verify approach is sound
2. **Begin Phase 1** - Add skipWebcrack parameter
3. **Iterate through phases** - Test after each phase
4. **Manual testing** - Validate with real bundles
5. **User validation** - Get feedback on fix

---

## FILES TO MODIFY

1. `src/unminify.ts` - Add skipWebcrack option
2. `src/commands/openai.ts` - File discovery + loop
3. `src/commands/openai-helpers.test.ts` (NEW) - Unit tests
4. `src/commands/openai-refinement.e2etest.ts` (NEW) - E2E tests
5. `src/test/fixtures/webpack-multi-bundle.js` (NEW) - Test fixture

---

## ESTIMATED TIMELINE

- **Development**: 3.5 hours
- **Testing**: 2 hours
- **Documentation**: 30 minutes
- **Buffer**: 30 minutes
- **TOTAL**: ~6.5 hours (1 day)

---

**Status**: READY FOR IMPLEMENTATION
**Next Action**: Begin Phase 1 (Add skipWebcrack parameter)
**Reviewer**: Technical Lead

---

**Generated**: 2025-11-17 08:23:24
**Full Plan**: PLAN-REFINEMENT-FIX-2025-11-17-082324.md
