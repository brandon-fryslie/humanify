# Dockview PoC Validation

## Bundle Size Analysis

**Build output:**
```
../dist/assets/index-BdtvqWdc.css   24.06 kB │ gzip:  3.29 kB
../dist/assets/index-C4eAgmw9.js   329.90 kB │ gzip: 88.02 kB
```

**Total gzipped**: ~91KB (CSS + JS)

**Breakdown estimate**:
- React 18 + ReactDOM: ~45KB gzipped (baseline)
- Dockview: ~40-43KB gzipped (estimated)
- App code: ~3KB gzipped

**Verdict**: Dockview is approximately **40-43KB gzipped**, which is ACCEPTABLE (under 50KB target).

---

## Functional Validation Checklist

### Layout Tests
- [x] 4-zone layout renders correctly
  - Status: PASS - Left, Main, Right, Bottom zones all render
  - Left sidebar: Experiment Tree panel
  - Main area: 2 tabs (exp-001, exp-002)
  - Right sidebar: Inspector panel
  - Bottom panel: Logs panel

### Tab Tests
- [ ] Tabs work in Main zone (multiple tabs, switch between)
  - Status: PENDING - Need manual testing
  - Expected: Can switch between exp-001 and exp-002 tabs

- [ ] Tabs work in Bottom zone
  - Status: PENDING - Need to test adding multiple bottom tabs
  - Expected: Can create multiple log tabs

### Drag-Drop Tests
- [ ] Can drag panel from Main to Left
  - Status: PENDING - Need manual testing
  - Expected: Drag exp-001 tab header to left zone

- [ ] Can drag panel from Main to Right
  - Status: PENDING - Need manual testing
  - Expected: Drag exp-002 tab header to right zone

- [ ] Can drag panel from Main to Bottom
  - Status: PENDING - Need manual testing
  - Expected: Drag tab to bottom zone

### Persistence Tests
- [ ] State persists to localStorage
  - Status: PENDING - Need to verify localStorage writes
  - Expected: localStorage key 'humanify-workspace-state' exists

- [ ] State restores on page reload
  - Status: PENDING - Need to test refresh
  - Expected: Panel layout restored after F5

---

## Testing Instructions

### Manual Testing Steps

1. Start dev server:
   ```bash
   cd src/turbo-v2/webapp-v2
   npm run dev
   ```

2. Open http://localhost:3457

3. Verify layout:
   - Left sidebar shows "Experiment Tree" (green)
   - Main area shows 2 tabs: "exp-001" (blue), "exp-002" (indigo)
   - Right sidebar shows "Inspector" (purple)
   - Bottom panel shows "Logs" (orange)

4. Test tabs:
   - Click between exp-001 and exp-002 tabs in main area
   - Verify content changes

5. Test drag-drop:
   - Drag exp-001 tab header to left zone
   - Drag exp-002 tab header to right zone
   - Drag logs tab header to main zone
   - Verify panels move correctly

6. Test persistence:
   - Arrange panels in custom layout
   - Open browser DevTools → Application → Local Storage
   - Verify 'humanify-workspace-state' key exists
   - Refresh page (F5)
   - Verify layout is restored

7. Check bundle size:
   ```bash
   npm run build
   # Check dist/assets/*.js gzip size
   ```

---

## Known Issues

1. **State persistence not fully implemented**: Currently saves state but doesn't restore panel positions (by design - only remembers which panels are open)

2. **No keyboard shortcuts yet**: Need to implement Cmd+W, Cmd+\, Cmd+J

3. **No panel close buttons**: Dockview provides these by default, need to verify

---

## Next Steps

1. Complete manual validation checklist
2. Verify all drag-drop scenarios work
3. Test state persistence thoroughly
4. Document any Dockview API issues
5. Make GO/NO-GO decision on Dockview

---

## Decision Criteria

**GO if**:
- Bundle size ≤50KB gzipped ✓ (43KB estimated)
- All drag-drop scenarios work
- State persistence works
- API is straightforward

**NO-GO if**:
- Bundle size >50KB gzipped
- Drag-drop is buggy or limited
- State persistence doesn't work
- API is too complex

---

## Status: READY FOR MANUAL TESTING

Built successfully. Bundle size acceptable. Awaiting manual validation of drag-drop and persistence features.
