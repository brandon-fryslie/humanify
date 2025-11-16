# Sprint: Checkpoint KISS Implementation

**Source**: PLAN-CHECKPOINT-KISS-2025-11-13-123459.md
**Generated**: 2025-11-13-123459
**Duration**: 1 day (5-6 hours)
**Goal**: Ship user-facing checkpoint UI with startup prompt and subcommands

---

## Sprint Overview

This sprint implements the remaining 20% of checkpoint functionality - all user-facing UI. Core checkpoint infrastructure is already complete and tested.

**Sprint Goal**: User can resume interrupted processing via startup prompt or `humanify resume` command.

---

## Sprint Backlog

### Hour 1: Verify and Fix Core (CRITICAL BLOCKER)

**P0-1: Verify checkpoint files are created** ⏱️ 30 min
- Build project
- Run real execution with `--turbo`
- Interrupt and check for `.humanify-checkpoints/*.json` files
- If missing: Add debug logging and diagnose
- If present: Proceed to next task

**DECISION POINT**: If checkpoints don't save, must fix before proceeding.

---

### Hour 2: Add Missing Metadata

**P1-1: Update Checkpoint interface with original args** ⏱️ 30 min

**Changes**:
1. `src/checkpoint.ts` - Add fields to interface
2. `src/plugins/local-llm-rename/visit-all-identifiers.ts` - Add to VisitOptions
3. `src/commands/unminify.ts` - Pass metadata to unminify

**Validation**:
- Build succeeds
- Existing tests pass
- Checkpoint JSON includes new fields

---

### Hours 3-4: Startup Prompt (Core Feature)

**P2-1: Implement startup checkpoint prompt** ⏱️ 2-3 hours

**Implementation Order**:
1. Add `promptUser()` helper function (10 min)
2. Add `handleCheckpointPrompt()` function (45 min)
   - Display checkpoint info
   - Compare args
   - Show warning if args differ
   - Handle user choice
3. Integrate into unminify command (30 min)
4. Test manually with small file (15 min)
5. Fix issues and polish output (30 min)

**Validation**:
- Prompt appears when checkpoint exists
- Warning shows when args differ
- Resume uses checkpoint's original args
- Start fresh deletes checkpoint
- Cancel exits cleanly

---

### Hour 5: Subcommands

**P3-1: Implement clear-checkpoints** ⏱️ 45 min
- Create `src/commands/checkpoints.ts`
- Implement clear command
- Register in `src/index.ts`
- Test manually

**P3-2: Implement resume command** ⏱️ 1 hour
- Add resume command to same file
- Print command for user to run
- Register in `src/index.ts`
- Test manually

---

### Hour 6: Testing and Polish

**P4-1: Manual validation** ⏱️ 30 min

**Test Scenarios**:
1. ✅ Normal completion (no checkpoint)
2. ✅ Resume from checkpoint
3. ✅ Start fresh with arg mismatch
4. ✅ clear-checkpoints with multiple files
5. ✅ resume command
6. ✅ Error handling (file not found)

**Final Checks**:
- All tests pass
- No debug output in production
- Clear user messages
- Clean git status

---

## Sprint Success Criteria

### Must Complete
- [ ] Checkpoint files verified to save correctly
- [ ] Startup prompt implemented and working
- [ ] clear-checkpoints command implemented
- [ ] resume command implemented
- [ ] All manual test scenarios pass

### Quality Gates
- [ ] No regressions (all existing tests pass)
- [ ] User-facing messages are clear
- [ ] No console.error for normal operations
- [ ] Backwards compatible with old checkpoints

---

## Blockers and Risks

### Known Blockers
None currently. All dependencies are in place.

### Potential Risks

**Risk 1: Checkpoint files not saving** (P0-1)
- **Impact**: HIGH - Blocks entire sprint
- **Probability**: MEDIUM
- **Mitigation**: Task P0-1 catches this early, can debug immediately

**Risk 2: Args comparison fails for complex objects**
- **Impact**: MEDIUM - Users see false warnings
- **Probability**: LOW
- **Mitigation**: Use JSON.stringify for deep comparison, test thoroughly

**Risk 3: User confused by prompts**
- **Impact**: LOW - Poor UX but functional
- **Probability**: MEDIUM
- **Mitigation**: Clear messages with examples, manual testing

---

## Implementation Notes

### Code Locations

**Existing Files to Modify**:
- `src/checkpoint.ts` - Interface update
- `src/plugins/local-llm-rename/visit-all-identifiers.ts` - Metadata plumbing
- `src/commands/unminify.ts` - Startup prompt
- `src/index.ts` - Command registration

**New Files to Create**:
- `src/commands/checkpoints.ts` - Subcommands

### Shared Utilities

Move to a shared file if reused across commands:

```typescript
// src/prompt-utils.ts
export async function promptUser(message: string): Promise<string> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
```

### Testing Approach

**Unit Tests**: None needed (UI code, manual testing sufficient)

**E2E Tests**: Existing checkpoint tests already validate core logic

**Manual Tests**: Use test script from P4-1

---

## Sprint Timeline

### Morning (Hours 1-3)
```
09:00 - 09:30  P0-1  Verify core checkpoint save
09:30 - 10:00  P1-1  Add checkpoint metadata fields
10:00 - 12:00  P2-1  Implement startup prompt
```

### Afternoon (Hours 4-6)
```
13:00 - 13:45  P3-1  Implement clear-checkpoints
13:45 - 14:45  P3-2  Implement resume command
14:45 - 15:15  P4-1  Manual testing and polish
```

**Contingency**: 30 minutes buffer for debugging or issues

---

## Definition of Done

### Feature Checklist
- [ ] User runs `humanify unminify file.js --turbo`
- [ ] If checkpoint exists, prompt appears automatically
- [ ] User can choose resume, start fresh, or cancel
- [ ] Resume uses checkpoint's original args
- [ ] Args mismatch shows clear warning
- [ ] `humanify clear-checkpoints` lists and deletes all
- [ ] `humanify resume` shows command to run
- [ ] All edge cases handled gracefully

### Code Quality
- [ ] All existing tests pass (51/51)
- [ ] No debug console.log statements
- [ ] Error messages are actionable
- [ ] Code follows existing patterns
- [ ] No dead code or TODOs

### Documentation
- [ ] CLAUDE.md updated with checkpoint usage
- [ ] Comments explain non-obvious logic
- [ ] Public functions have JSDoc

---

## Rollback Plan

If critical issues found:

1. **Checkpoint save fails** (P0-1)
   - Debug and fix immediately
   - If unfixable: Revert checkpoint integration, file bug

2. **Startup prompt breaks execution** (P2-1)
   - Can comment out prompt integration
   - Core checkpoint logic still works
   - Ship subcommands only

3. **Tests fail** (Any task)
   - Identify root cause
   - Fix or revert specific change
   - Don't ship until tests pass

**Emergency Rollback**: All changes in 3 files, easy to revert:
```bash
git checkout main -- src/checkpoint.ts src/commands/unminify.ts src/index.ts
git clean -f src/commands/checkpoints.ts
```

---

## Post-Sprint

### Immediate Follow-up
- Update CLAUDE.md with usage examples
- Document any gotchas discovered during testing
- Create issue for any P2/P3 features if users request

### Future Enhancements (Out of Scope)
- Signal handlers for graceful Ctrl+C
- Checkpoint compression
- Auto-cleanup of old checkpoints
- Progress tracking within batches

**Note**: Only implement future enhancements if users actually need them. KISS principle.

---

## Sprint Retrospective Questions

After sprint completion:

1. Did checkpoint save work correctly? (P0-1)
2. Was startup prompt UX clear to users?
3. Any confusion from args mismatch warnings?
4. Were time estimates accurate?
5. Any technical debt introduced?
6. What would you do differently?

---

**Sprint Ready**: Start with P0-1 verification. Block all other work until core is confirmed working.
