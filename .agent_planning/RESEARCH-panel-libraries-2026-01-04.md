# Research: React Panel Layout Libraries for HumanifyJS Webapp v2

## Question
Which React panel layout library best supports the HumanifyJS webapp v2 requirements for a 4-zone layout (left, main, right, bottom) with tabs in each zone and drag-drop functionality between zones?

## Requirements (Priority Order)
1. Tabs support: All 4 zones must support multiple tabs
2. Drag-drop: Panels must be draggable between zones
3. TypeScript: Strong typing, no `any` types
4. Active maintenance: Last commit <6 months
5. Bundle size: <50KB gzipped preferred
6. API simplicity: Minimal boilerplate

## Comparison Matrix

| Library | Tabs | Drag-Drop | TypeScript | Maintenance | Bundle | Recommendation |
|---------|------|-----------|------------|-------------|--------|----------------|
| **Dockview** | ✅ Built-in | ✅ Full | ✅ 85% TS | ✅ Dec 2025 | ❓ Unknown | **RECOMMENDED** |
| FlexLayout | ✅ Built-in | ✅ Full | ✅ Good | ⚠️ Aug 2025 | ❓ Unknown | Fallback |
| rc-dock | ✅ Built-in | ✅ Good | ✅ 83% TS | ⚠️ Sep 2025 | ❓ Unknown | Alpha version |
| react-mosaic | ❌ Custom needed | ⚠️ Partial | ✅ Full | ✅ Sep 2024 | ❌ 258KB | Too large |
| react-grid-layout | ❌ None | ⚠️ Grid only | ✅ V2 rewrite | ✅ Active | ❓ Unknown | Wrong paradigm |
| Allotment | ❌ None | ❌ Resize only | ✅ Full | ✅ Active | ✅ Small | Missing features |
| react-resizable-panels | ❌ None | ❌ Resize only | ✅ Full | ✅ Active | ✅ ~7-10KB | Missing features |

## Recommendation: Dockview

**Rationale**: Only library meeting ALL requirements out-of-the-box:
- ✅ Native tabs with groups and overflow handling
- ✅ Full drag-drop between zones (tab and group docking)
- ✅ Excellent TypeScript (85.4% TypeScript codebase)
- ✅ Very active (Dec 29, 2025 latest commit)
- ✅ Zero dependencies (framework-agnostic core)
- ✅ Clean API with lazy loading support

**Code Example**:
```typescript
import { DockviewReact, DockviewReadyEvent } from 'dockview';

const MyComponent = () => {
  const onReady = (event: DockviewReadyEvent) => {
    event.api.addPanel({
      id: 'left-panel',
      component: 'fileTree',
      title: 'Files'
    });
    event.api.addPanel({
      id: 'main-input',
      component: 'editor',
      title: 'Input Code'
    });
  };

  return (
    <DockviewReact
      onReady={onReady}
      components={{
        fileTree: () => <FileTreePanel />,
        editor: () => <EditorPanel />
      }}
    />
  );
};
```

**Fallback Plan**:
1. If bundle size >50KB gzipped → Switch to @aptre/flex-layout
2. If stability issues → Consider rc-dock (alpha but similar features)

**Risks**:
- Bundle size unknown (needs PoC testing)
- Smaller community (2.9k stars vs 21.9k for react-grid-layout)
- Newer library (less battle-tested than FlexLayout)

## Next Steps
1. Create PoC with Dockview
2. Measure actual bundle size
3. Test 4-zone layout + tabs + drag-drop
4. Test state persistence
5. Make final decision

## Decision Status: READY FOR POC
