/**
 * Tests for AnchorDetector - Importance Scoring
 *
 * Validates:
 * - Importance score calculation
 * - Anchor threshold detection
 * - Export handling
 * - Edge cases
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAnchorDetector, type Identifier, type AnchorDetectorConfig } from './anchor-detector.js';

describe('AnchorDetector', () => {
  /**
   * D6.1: computeImportance returns score 0-1
   */
  it('D6.1: computeImportance returns score 0-1', () => {
    const detector = createAnchorDetector();

    // Low references, not exported
    const lowImportance: Identifier = {
      id: 'id1',
      name: 'a',
      bindingType: 'var',
      scopeId: 'scope1',
      references: 1,
      context: '',
    };

    // High references, exported
    const highImportance: Identifier = {
      id: 'id2',
      name: 'parseQueryString',
      bindingType: 'function',
      scopeId: 'scope1',
      references: 50,
      context: '',
      isExported: true,
    };

    const lowScore = detector.computeImportance(lowImportance);
    const highScore = detector.computeImportance(highImportance);

    // Scores in 0-1 range
    assert.ok(lowScore >= 0 && lowScore <= 1, `Low score ${lowScore} not in 0-1 range`);
    assert.ok(highScore >= 0 && highScore <= 1, `High score ${highScore} not in 0-1 range`);

    // High importance > low importance
    assert.ok(highScore > lowScore, `High score ${highScore} should be > low score ${lowScore}`);

    console.log(`  ✓ Low importance: ${lowScore.toFixed(3)}`);
    console.log(`  ✓ High importance: ${highScore.toFixed(3)}`);
  });

  /**
   * D6.1: detectAnchors returns top N% by threshold
   */
  it('D6.1: detectAnchors returns top N% (default 20%)', () => {
    const detector = createAnchorDetector({
      threshold: 0.2, // Top 20%
      minReferences: 3,
      exportsAreAnchors: false, // Test threshold only
    });

    const identifiers: Identifier[] = [
      { id: 'id1', name: 'a', bindingType: 'var', scopeId: 's1', references: 1, context: '' },
      { id: 'id2', name: 'b', bindingType: 'var', scopeId: 's1', references: 5, context: '' },
      { id: 'id3', name: 'c', bindingType: 'var', scopeId: 's1', references: 10, context: '' },
      { id: 'id4', name: 'd', bindingType: 'var', scopeId: 's1', references: 20, context: '' },
      { id: 'id5', name: 'e', bindingType: 'var', scopeId: 's1', references: 50, context: '' },
    ];

    const anchors = detector.detectAnchors(identifiers);

    // 5 identifiers, top 20% = 1 anchor (ceil(5 * 0.2) = 1)
    // But id1 has < 3 references, so only 4 candidates
    // Top 20% of 4 = 1 anchor
    assert.ok(anchors.length >= 1 && anchors.length <= 2, `Expected 1-2 anchors, got ${anchors.length}`);

    // Highest references should be first
    assert.equal(anchors[0].name, 'e', `Top anchor should be 'e' (50 refs), got ${anchors[0].name}`);

    console.log(`  ✓ Detected ${anchors.length} anchors from ${identifiers.length} identifiers`);
    console.log(`  ✓ Top anchor: ${anchors[0].name} (${anchors[0].references} refs)`);
  });

  /**
   * D6.1: Exports always included when exportsAreAnchors=true
   */
  it('D6.1: Exports always included as anchors', () => {
    const detector = createAnchorDetector({
      threshold: 0.1, // Top 10%
      minReferences: 10,
      exportsAreAnchors: true,
    });

    const identifiers: Identifier[] = [
      { id: 'id1', name: 'exported', bindingType: 'function', scopeId: 's1', references: 1, context: '', isExported: true },
      { id: 'id2', name: 'internal', bindingType: 'var', scopeId: 's1', references: 100, context: '' },
    ];

    const anchors = detector.detectAnchors(identifiers);

    // Both should be anchors:
    // - 'internal' has high references (top 10%)
    // - 'exported' is exported (forced anchor)
    assert.ok(anchors.length === 2, `Expected 2 anchors, got ${anchors.length}`);
    assert.ok(anchors.some((a) => a.name === 'exported'), 'Exported identifier should be anchor');
    assert.ok(anchors.some((a) => a.name === 'internal'), 'High-reference identifier should be anchor');

    console.log(`  ✓ Both exported and high-reference identifiers are anchors`);
  });

  /**
   * D6.1: Score formula matches specification
   */
  it('D6.1: Score formula matches specification', () => {
    const detector = createAnchorDetector();

    // Test case: 10 references, exported
    const identifier: Identifier = {
      id: 'id1',
      name: 'testFunc',
      bindingType: 'function',
      scopeId: 'scope1',
      references: 10,
      context: '',
      isExported: true,
    };

    const score = detector.computeImportance(identifier);

    // Formula: 0.5 * log(references) + 0.3 * (isExport ? 1 : 0) + 0.2 * (scopeSize / maxScope)
    // log(11) / 4.6 ≈ 0.52 (normalized log scale)
    // 0.5 * 0.52 + 0.3 * 1 + 0.2 * 0 ≈ 0.26 + 0.3 = 0.56

    assert.ok(score > 0.5 && score < 0.7, `Expected score ~0.56, got ${score.toFixed(3)}`);

    console.log(`  ✓ Score formula: ${score.toFixed(3)} (expected ~0.56)`);
  });

  /**
   * D6.1: Edge case - no identifiers
   */
  it('Edge case: Empty identifiers list returns empty anchors', () => {
    const detector = createAnchorDetector();
    const anchors = detector.detectAnchors([]);

    assert.equal(anchors.length, 0, 'Empty input should return empty anchors');
    console.log(`  ✓ Empty input handled correctly`);
  });

  /**
   * D6.1: Edge case - all identifiers below threshold
   */
  it('Edge case: All identifiers below minReferences threshold', () => {
    const detector = createAnchorDetector({
      minReferences: 10,
      exportsAreAnchors: false,
    });

    const identifiers: Identifier[] = [
      { id: 'id1', name: 'a', bindingType: 'var', scopeId: 's1', references: 1, context: '' },
      { id: 'id2', name: 'b', bindingType: 'var', scopeId: 's1', references: 2, context: '' },
      { id: 'id3', name: 'c', bindingType: 'var', scopeId: 's1', references: 5, context: '' },
    ];

    const anchors = detector.detectAnchors(identifiers);

    assert.equal(anchors.length, 0, 'All below threshold should return empty');
    console.log(`  ✓ All below threshold handled correctly`);
  });

  /**
   * D6.1: getStats provides accurate statistics
   */
  it('D6.1: getStats provides accurate anchor statistics', () => {
    const detector = createAnchorDetector({
      threshold: 0.2,
      minReferences: 3,
    });

    const identifiers: Identifier[] = [
      { id: 'id1', name: 'a', bindingType: 'var', scopeId: 's1', references: 5, context: '' },
      { id: 'id2', name: 'b', bindingType: 'var', scopeId: 's1', references: 10, context: '' },
      { id: 'id3', name: 'c', bindingType: 'var', scopeId: 's1', references: 20, context: '' },
      { id: 'id4', name: 'd', bindingType: 'var', scopeId: 's1', references: 50, context: '' },
      { id: 'id5', name: 'e', bindingType: 'var', scopeId: 's1', references: 100, context: '' },
    ];

    const stats = detector.getStats(identifiers);

    assert.equal(stats.totalIdentifiers, 5, 'Total identifiers should be 5');
    assert.ok(stats.anchorCount >= 1, 'Should have at least 1 anchor');
    assert.ok(stats.anchorPercentage > 0 && stats.anchorPercentage <= 100, 'Percentage in 0-100 range');
    assert.ok(stats.maxImportance >= stats.minImportance, 'Max importance >= min importance');

    console.log(`  ✓ Stats: ${stats.anchorCount} anchors (${stats.anchorPercentage.toFixed(1)}%)`);
    console.log(`  ✓ Importance range: ${stats.minImportance.toFixed(3)} - ${stats.maxImportance.toFixed(3)}`);
  });

  /**
   * Integration test: Realistic scenario with mixed identifiers
   */
  it('Integration: Realistic scenario with mixed identifiers', () => {
    const detector = createAnchorDetector({
      threshold: 0.15, // Top 15%
      minReferences: 3,
      exportsAreAnchors: true,
    });

    const identifiers: Identifier[] = [
      // High-value exports
      { id: 'id1', name: 'parseQueryString', bindingType: 'function', scopeId: 's1', references: 25, context: '', isExported: true },
      { id: 'id2', name: 'stringify', bindingType: 'function', scopeId: 's1', references: 30, context: '', isExported: true },

      // Internal high-reference
      { id: 'id3', name: 'formatters', bindingType: 'var', scopeId: 's1', references: 15, context: '' },
      { id: 'id4', name: 'utils', bindingType: 'var', scopeId: 's1', references: 20, context: '' },

      // Low-value internals
      { id: 'id5', name: 'temp', bindingType: 'var', scopeId: 's2', references: 1, context: '' },
      { id: 'id6', name: 'i', bindingType: 'var', scopeId: 's2', references: 2, context: '' },

      // Low-value export (should still be anchor)
      { id: 'id7', name: 'version', bindingType: 'var', scopeId: 's1', references: 0, context: '', isExported: true },
    ];

    const anchors = detector.detectAnchors(identifiers);

    // Expected anchors:
    // - All 3 exports (parseQueryString, stringify, version)
    // - Top internal by references (utils, formatters)
    assert.ok(anchors.length >= 3, `Expected at least 3 anchors (exports), got ${anchors.length}`);

    // Check all exports are present
    const anchorNames = anchors.map((a) => a.name);
    assert.ok(anchorNames.includes('parseQueryString'), 'Export parseQueryString should be anchor');
    assert.ok(anchorNames.includes('stringify'), 'Export stringify should be anchor');
    assert.ok(anchorNames.includes('version'), 'Export version should be anchor');

    console.log(`  ✓ Realistic scenario: ${anchors.length} anchors detected`);
    console.log(`  ✓ Anchor names: ${anchorNames.join(', ')}`);
  });
});
