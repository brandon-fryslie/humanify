# Sprint: Checkpoint Debug & Unblock

**Sprint Goal**: Fix AST transformation bug and unblock checkpoint system
**Duration**: Days 1-2 (4-6 hours)
**Status**: READY TO START
**Generated**: 2025-11-13-040718

---

## Sprint Overview

**CRITICAL BLOCKER**: The checkpoint system is 80% coded but 0% functional due to a single bug - `parseAsync` returns `ParseResult<File>` but `transformFromAstAsync` expects `File`. This sprint focuses on diagnosing and fixing this type mismatch to unblock all downstream work.

**Why This Sprint Matters**:
- Blocks ALL checkpoint functionality
- 5/8 e2e tests failing with identical error
- No checkpoint files being created
- $400/month waste continues until fixed

**Sprint Success Criteria**:
- [ ] AST bug root cause identified and documented
- [ ] Fix implemented and verified
- [ ] Checkpoint files successfully created
- [ ] E2E tests passing (8/8)

---

## Sprint Backlog

### Day 1: Diagnosis (2-3 hours)

#### Task 1.1: Setup Debug Environment (30 min)

**Objective**: Prepare for systematic debugging

**Actions**:
```bash
# 1. Ensure clean state
cd ~/icode/brandon-fryslie_humanify
npm run build

# 2. Verify test failure
npm run test:e2e -- src/checkpoint-resume.e2etest.ts

# 3. Note exact error message
# Expected: "AST root must be a Program or File node"
```

**Deliverables**:
- Clean build
- Confirmed test failure
- Exact error message captured

---

#### Task 1.2: Add Debug Instrumentation (30 min)

**Objective**: Add logging to understand AST type at error point

**File**: `src/plugins/local-llm-rename/visit-all-identifiers.ts`

**Changes**:

**Location 1: After parseAsync (line 56-69)**
```typescript
const ast = await instrumentation.measure(
  "parse-ast",
  () => parseAsync(codeToProcess, { sourceType: "unambiguous" }),
  { codeSize: codeToProcess.length }
);

// DEBUG: Log AST structure
console.log('[DEBUG] parseAsync result:', {
  type: typeof ast,
  isNull: ast === null,
  constructor: ast?.constructor?.name,
  keys: ast ? Object.keys(ast) : [],
  hasType: ast && 'type' in ast,
  astType: (ast as any)?.type,
  hasProgram: ast && 'program' in ast,
  programType: (ast as any)?.program?.type
});
```

**Location 2: Before transformFromAstAsync (line 116)**
```typescript
console.log('[DEBUG] Before transformFromAstAsync (line 116):', {
  type: typeof ast,
  astType: (ast as any)?.type,
  isFile: (ast as any)?.type === 'File',
  isProgram: (ast as any)?.type === 'Program',
  hasProgram: ast && 'program' in ast
});

const stringified = await instrumentation.measure("transform-ast", () =>
  transformFromAstAsync(ast)
);
```

**Location 3: Before transformFromAstAsync (line 378)**
```typescript
// Build renames map from history
const renamesMap: Record<string, string> = {};
for (const rename of renamesHistory) {
  renamesMap[rename.oldName] = rename.newName;
}

// DEBUG: Log AST state before checkpoint save
console.log('[DEBUG] Before transformFromAstAsync (line 378 - checkpoint save):', {
  type: typeof ast,
  astType: (ast as any)?.type,
  isFile: (ast as any)?.type === 'File',
  isProgram: (ast as any)?.type === 'Program',
  hasProgram: ast && 'program' in ast,
  programBodyLength: (ast as any)?.program?.body?.length
});

// Transform current AST state to code
const transformed = await transformFromAstAsync(ast, undefined, {
  retainLines: false,
  compact: false,
  comments: true
});
```

**Deliverables**:
- Debug logging added at 3 key locations
- Code compiles: `npm run build`

---

#### Task 1.3: Run Instrumented Test (30 min)

**Objective**: Capture debug output and diagnose issue

**Actions**:
```bash
# Run single failing test with full output
npm run test:e2e -- src/checkpoint-resume.e2etest.ts 2>&1 | tee debug-output.txt

# Analyze debug logs
grep -A5 "DEBUG" debug-output.txt
```

**Questions to Answer**:
1. What does `parseAsync` actually return?
   - Is it `ParseResult<File>`?
   - Is it `File`?
   - Is it something else?

2. What type does `transformFromAstAsync` expect?
   - Does it accept `ParseResult<File>`?
   - Does it require `File`?
   - Does it require `Program`?

3. Where is the type mismatch?
   - Is `ast` the wrong type throughout?
   - Is the issue specific to checkpoint save (line 378)?

**Deliverables**:
- `debug-output.txt` file with full test output
- Answers to all 3 diagnostic questions
- Root cause hypothesis documented

---

#### Task 1.4: Research Babel Documentation (30-60 min)

**Objective**: Verify correct Babel API usage

**Research Questions**:
1. What does `parseAsync` return?
   - Check @babel/core TypeScript definitions
   - Check Babel official docs
   - Check GitHub issues for similar problems

2. What does `transformFromAstAsync` expect?
   - First parameter type
   - Second parameter purpose (source code)
   - Third parameter (options)

3. How to correctly transform AST to code?
   - Example code from Babel docs
   - Common patterns in other projects

**Resources**:
- https://babeljs.io/docs/babel-core
- https://github.com/babel/babel/blob/main/packages/babel-core/src/parse.ts
- https://github.com/babel/babel/issues?q=transformFromAstAsync

**Web Search** (if needed):
```
babel transformFromAstAsync ParseResult File node type mismatch
babel parseAsync return type
babel AST root must be Program or File error
```

**Deliverables**:
- Documentation of correct Babel API usage
- Example code showing proper pattern
- Confirmation of root cause

---

### Day 2: Fix & Verify (2-3 hours)

#### Task 2.1: Implement Fix (30-60 min)

**Objective**: Apply correct fix based on diagnosis

**Expected Fix** (based on research):

The issue is that `parseAsync` returns `ParseResult<File>`, which wraps a `File` node. However, `ParseResult<File>` extends `File`, so it SHOULD work. The error suggests Babel's runtime validation is stricter than the TypeScript types indicate.

**Likely Solutions**:

**Option A: Type Assertion** (if ParseResult extends File)
```typescript
// Line 116
const stringified = await transformFromAstAsync(ast as File);

// Line 378
const transformed = await transformFromAstAsync(ast as File, undefined, {
  retainLines: false,
  compact: false,
  comments: true
});
```

**Option B: Provide Source Code** (if second param required)
```typescript
// transformFromAstAsync(ast, code, options)
// Second param is original source code (optional but may help)

// Line 116
const stringified = await transformFromAstAsync(ast, codeToProcess);

// Line 378
const transformed = await transformFromAstAsync(ast, codeToProcess, {
  retainLines: false,
  compact: false,
  comments: true
});
```

**Option C: Extract File Node** (if ParseResult has .ast property)
```typescript
// If parseAsync returns { ast: File, errors: [] }
// Need to extract the actual File node

// After line 58
const parseResult = await parseAsync(codeToProcess, { sourceType: "unambiguous" });
const ast = parseResult?.ast || parseResult;  // Extract File node if wrapped

// Then use ast normally in transformFromAstAsync
```

**Option D: Use Parse Result Type Correctly** (if File is at ast.program)
```typescript
// If File node is at ast.program
// This is UNLIKELY but possible

// Line 116
const stringified = await transformFromAstAsync({ type: 'File', program: ast.program });
```

**Action**:
1. Based on Task 1.4 research, choose correct option
2. Apply fix to all 3 locations (lines 116, 378, 450)
3. Remove debug logging (or comment out)
4. Build: `npm run build`

**Deliverables**:
- Fix implemented in visit-all-identifiers.ts
- Code compiles successfully
- No new lint errors

---

#### Task 2.2: Verify Fix with Tests (30 min)

**Objective**: Confirm AST error is resolved

**Actions**:
```bash
# 1. Run failing e2e test
npm run test:e2e -- src/checkpoint-resume.e2etest.ts

# Expected: All 8 tests PASS (was 3/8 before fix)

# 2. Verify checkpoint files created
ls -la .humanify-checkpoints/

# Expected: Directory NOT empty, .json files exist

# 3. Inspect checkpoint file
cat .humanify-checkpoints/*.json | jq '.'

# Expected: Valid JSON with populated fields
```

**Success Criteria**:
- [ ] All 8/8 e2e tests PASS
- [ ] No "AST root must be Program or File" errors
- [ ] Checkpoint directory contains .json files
- [ ] Checkpoint files are valid JSON

**If Tests Still Fail**:
1. Review error messages (different error = progress)
2. Check if NEW bugs introduced by fix
3. Verify fix applied correctly at all locations
4. Re-run diagnosis with updated logging

**Deliverables**:
- E2E test results (8/8 passing)
- Screenshot of checkpoint files in directory
- Confirmation that AST bug is RESOLVED

---

#### Task 2.3: Validate Checkpoint Contents (30 min)

**Objective**: Ensure checkpoint data is correct

**Actions**:
```bash
# 1. Pretty-print checkpoint
cat .humanify-checkpoints/*.json | jq '.' > checkpoint-sample.json

# 2. Validate structure
cat checkpoint-sample.json
```

**Manual Inspection Checklist**:
- [ ] `version` field = "2.0.0"
- [ ] `timestamp` field is recent Unix timestamp
- [ ] `inputHash` field is 16-char hex string
- [ ] `completedBatches` is positive integer
- [ ] `totalBatches` is positive integer
- [ ] `completedBatches` ≤ `totalBatches`
- [ ] `renames` object is NOT empty `{}`
- [ ] `renames` has multiple key-value pairs
- [ ] `renames` values are valid identifiers (not empty strings)
- [ ] `partialCode` field is NOT empty string
- [ ] `partialCode` contains valid JavaScript

**Validate partialCode**:
```bash
# Extract partialCode and validate syntax
cat checkpoint-sample.json | jq -r '.partialCode' > partial-code.js
node --check partial-code.js

# Expected: No syntax errors
```

**Deliverables**:
- Checkpoint file validated against schema
- partialCode verified as valid JavaScript
- Screenshot/notes of any issues found

---

#### Task 2.4: Run Full Test Suite (1 hour)

**Objective**: Ensure no regressions from AST fix

**Actions**:
```bash
# 1. Run ALL tests
npm test

# Expected: Most tests pass (previously 85/126)

# 2. Run test suites separately
npm run test:unit
npm run test:e2e

# 3. Check for AST-related failures
npm test 2>&1 | grep -i "ast root"

# Expected: ZERO matches (AST error eliminated)
```

**Test Results Analysis**:
- Total tests: X
- Passing: Y
- Failing: Z
- Improvement: (Y_after - Y_before) tests fixed

**Expected Improvement**:
- Before fix: 85/126 passing (67%)
- After fix: ~120/126 passing (95%)
- Improvement: ~35 tests fixed (mostly AST errors)

**Remaining Failures** (if any):
- Document which tests still fail
- Determine if failures related to checkpoint work
- Decide if failures are blockers or known issues

**Deliverables**:
- Full test suite results
- Comparison: before fix vs after fix
- List of remaining failures (if any)
- Decision: Is AST bug fully resolved?

---

## Sprint Deliverables

**Code Changes**:
- [ ] AST type fix applied to visit-all-identifiers.ts (3 locations)
- [ ] Code builds successfully
- [ ] No new lint errors

**Tests**:
- [ ] checkpoint-resume.e2etest.ts: 8/8 passing (was 3/8)
- [ ] Full test suite improvement: ~35 tests fixed
- [ ] No AST-related errors in test output

**Files Created**:
- [ ] Checkpoint files in `.humanify-checkpoints/` directory
- [ ] debug-output.txt (diagnostic logs)
- [ ] checkpoint-sample.json (validated checkpoint)
- [ ] Sprint completion notes

**Documentation**:
- [ ] Root cause documented
- [ ] Fix explanation documented
- [ ] Validation results documented
- [ ] Update SESSION-FINAL-EVALUATION with fix details

---

## Sprint Success Metrics

**MUST ACHIEVE** (Sprint Success):
- [ ] AST bug root cause identified
- [ ] Fix implemented and working
- [ ] Checkpoint files successfully created
- [ ] E2E tests: 8/8 passing

**NICE TO HAVE** (Stretch Goals):
- [ ] All tests passing (126/126)
- [ ] Checkpoint contents validated
- [ ] Performance acceptable (no slowdown)

**BLOCKER** (Sprint Failure):
- [ ] AST bug unresolved after 6 hours → ESCALATE to Babel team
- [ ] Tests still failing with different errors → RE-EVALUATE approach
- [ ] Checkpoints not persisting → INVESTIGATE file I/O issues

---

## Risk Mitigation

**Risk 1: Fix doesn't work**
- **Mitigation**: Time-box to 6 hours total
- **Escalation**: Post to Babel Discussions with minimal repro
- **Fallback**: Use `transformSync` instead of `transformFromAstAsync`

**Risk 2: New bugs introduced**
- **Mitigation**: Run full test suite after fix
- **Escalation**: Revert fix, try alternative approach
- **Fallback**: Disable checkpoints, document as known issue

**Risk 3: Checkpoints still not persisting**
- **Mitigation**: Add extensive logging around file I/O
- **Escalation**: Check file permissions, disk space
- **Fallback**: Use alternative storage (in-memory, database)

---

## Next Steps After Sprint

**If Sprint Succeeds** (AST bug fixed):
1. Proceed to Phase 2: Complete P0 Requirements (P0-5 through P0-9)
2. Estimated: 10 hours
3. Goal: Resume correctness proven, cost savings measured

**If Sprint Fails** (AST bug not resolved):
1. STOP all checkpoint work
2. Escalate to Babel community
3. Consider alternative approaches:
   - Use different AST library (acorn, recast)
   - Disable checkpoints (document as future work)
   - Store untransformed AST (serialize differently)
4. Re-evaluate ROI: Is checkpoint feature worth continued investment?

---

## Definition of Sprint Done

Sprint is DONE when:
- [ ] AST bug diagnosed with confidence (>90% certainty)
- [ ] Fix implemented and code compiles
- [ ] Checkpoint files created (directory not empty)
- [ ] E2E tests passing (8/8)
- [ ] Test suite improved (>90% passing)
- [ ] Validation complete (checkpoint contents correct)
- [ ] Sprint retrospective documented
- [ ] Next sprint planned (Phase 2: P0 completion)

---

**Sprint Start**: Day 1
**Sprint End**: Day 2 (max 6 hours total)
**Next Sprint**: Phase 2 - Complete P0 Requirements (10 hours)
**Ultimate Goal**: Production-ready checkpoint system (29 hours total)
