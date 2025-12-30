/**
 * Tests for RegressionDetector - Quality Regression Detection
 *
 * Validates:
 * - Regression detection (confidence drop >10%)
 * - Policy handling (keep-best vs keep-latest)
 * - Per-identifier history tracking
 * - Warning on high regression rate
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRegressionDetector } from './regression-detector.js';

describe('RegressionDetector', () => {
  /**
   * D6.3: Detects regression when confidence[N] < confidence[N-1] * 0.9
   */
  it('D6.3: Detects 10% confidence drop as regression', () => {
    const detector = createRegressionDetector();

    // Track identifier across 3 passes with regression in pass 2
    detector.trackRename('id1', 1, 'configHandler', 0.8);
    detector.trackRename('id1', 2, 'handler', 0.6); // 25% drop (0.8 -> 0.6)
    detector.trackRename('id1', 3, 'processConfig', 0.85);

    const report = detector.detectRegressions();

    // Should detect 1 regression (pass 1 -> 2)
    assert.equal(report.regressedCount, 1, `Expected 1 regression, got ${report.regressedCount}`);
    assert.equal(report.regressions.length, 1, 'Should have 1 regression entry');

    const regression = report.regressions[0];
    assert.equal(regression.id, 'id1');
    assert.equal(regression.previousPass, 1);
    assert.equal(regression.currentPass, 2);
    assert.equal(regression.previousConfidence, 0.8);
    assert.equal(regression.currentConfidence, 0.6);

    console.log(`  ✓ Detected regression: ${regression.previousName} (${regression.previousConfidence}) -> ${regression.currentName} (${regression.currentConfidence})`);
  });

  /**
   * D6.3: Does NOT detect regression when confidence drop < 10%
   */
  it('D6.3: No regression when confidence drop < 10%', () => {
    const detector = createRegressionDetector();

    // Small confidence variation (within 10% threshold)
    detector.trackRename('id1', 1, 'config', 0.8);
    detector.trackRename('id1', 2, 'configuration', 0.75); // 6.25% drop (within threshold)

    const report = detector.detectRegressions();

    assert.equal(report.regressedCount, 0, 'Should not detect regression for small drop');
    console.log(`  ✓ No regression detected for small drop (0.8 -> 0.75)`);
  });

  /**
   * D6.3: Policy 'keep-best' returns highest confidence name
   */
  it("D6.3: Policy 'keep-best' returns highest confidence", () => {
    const detector = createRegressionDetector({ policy: 'keep-best' });

    detector.trackRename('id1', 1, 'handler', 0.7);
    detector.trackRename('id1', 2, 'configHandler', 0.9); // Best
    detector.trackRename('id1', 3, 'config', 0.6);

    const best = detector.getBestName('id1');

    assert.ok(best !== null, 'getBestName should return a result');
    assert.equal(best.name, 'configHandler', 'Should return highest confidence name');
    assert.equal(best.confidence, 0.9);
    assert.equal(best.pass, 2);

    console.log(`  ✓ keep-best: ${best.name} (confidence ${best.confidence} from pass ${best.pass})`);
  });

  /**
   * D6.3: Policy 'keep-latest' returns most recent name
   */
  it("D6.3: Policy 'keep-latest' returns most recent name", () => {
    const detector = createRegressionDetector({ policy: 'keep-latest' });

    detector.trackRename('id1', 1, 'handler', 0.9);
    detector.trackRename('id1', 2, 'config', 0.6); // Latest (but lower confidence)

    const latest = detector.getBestName('id1');

    assert.ok(latest !== null, 'getBestName should return a result');
    assert.equal(latest.name, 'config', 'Should return latest name');
    assert.equal(latest.confidence, 0.6);
    assert.equal(latest.pass, 2);

    console.log(`  ✓ keep-latest: ${latest.name} (confidence ${latest.confidence} from pass ${latest.pass})`);
  });

  /**
   * D6.3: Per-identifier history tracked correctly
   */
  it('D6.3: Per-identifier history tracked across passes', () => {
    const detector = createRegressionDetector();

    detector.trackRename('id1', 1, 'a', 0.5);
    detector.trackRename('id1', 2, 'config', 0.8);
    detector.trackRename('id1', 3, 'configuration', 0.9);

    const history = detector.getHistory('id1');

    assert.ok(history !== null, 'History should exist');
    assert.equal(history.id, 'id1');
    assert.equal(history.passes.length, 3, 'Should have 3 passes');

    // Check passes are in order
    assert.equal(history.passes[0].pass, 1);
    assert.equal(history.passes[0].name, 'a');
    assert.equal(history.passes[1].pass, 2);
    assert.equal(history.passes[1].name, 'config');
    assert.equal(history.passes[2].pass, 3);
    assert.equal(history.passes[2].name, 'configuration');

    console.log(`  ✓ History tracked: ${history.passes.map((p) => `${p.name} (${p.confidence})`).join(' -> ')}`);
  });

  /**
   * D6.3: Warning when regression rate > 10%
   */
  it('D6.3: Warning when regression rate > 10%', () => {
    const detector = createRegressionDetector({ warningThreshold: 0.1 });

    // Create 10 identifiers, 2 with regressions (20% rate > 10% threshold)
    for (let i = 1; i <= 10; i++) {
      detector.trackRename(`id${i}`, 1, `name${i}_v1`, 0.8);

      if (i <= 2) {
        // First 2 have regressions
        detector.trackRename(`id${i}`, 2, `name${i}_v2`, 0.5); // Regression
      } else {
        // Rest have improvements
        detector.trackRename(`id${i}`, 2, `name${i}_v2`, 0.9);
      }
    }

    const report = detector.detectRegressions();

    assert.equal(report.totalIdentifiers, 10);
    assert.equal(report.regressedCount, 2);
    assert.equal(report.regressionRate, 0.2); // 20%
    assert.ok(report.shouldWarn, 'Should warn when rate > threshold');

    console.log(`  ✓ Regression rate: ${(report.regressionRate * 100).toFixed(1)}% (warning: ${report.shouldWarn})`);
  });

  /**
   * D6.3: No warning when regression rate <= 10%
   */
  it('D6.3: No warning when regression rate <= 10%', () => {
    const detector = createRegressionDetector({ warningThreshold: 0.1 });

    // Create 10 identifiers, 1 with regression (10% rate = threshold)
    for (let i = 1; i <= 10; i++) {
      detector.trackRename(`id${i}`, 1, `name${i}_v1`, 0.8);

      if (i === 1) {
        detector.trackRename(`id${i}`, 2, `name${i}_v2`, 0.5); // Regression
      } else {
        detector.trackRename(`id${i}`, 2, `name${i}_v2`, 0.9);
      }
    }

    const report = detector.detectRegressions();

    assert.equal(report.regressionRate, 0.1); // Exactly 10%
    assert.ok(!report.shouldWarn, 'Should not warn at threshold');

    console.log(`  ✓ Regression rate: ${(report.regressionRate * 100).toFixed(1)}% (no warning)`);
  });

  /**
   * Edge case: Single pass (no regressions possible)
   */
  it('Edge case: Single pass has no regressions', () => {
    const detector = createRegressionDetector();

    detector.trackRename('id1', 1, 'config', 0.8);
    detector.trackRename('id2', 1, 'handler', 0.9);

    const report = detector.detectRegressions();

    assert.equal(report.regressedCount, 0, 'Single pass should have no regressions');
    console.log(`  ✓ Single pass: no regressions`);
  });

  /**
   * Edge case: Empty history
   */
  it('Edge case: Empty history returns null', () => {
    const detector = createRegressionDetector();

    const history = detector.getHistory('nonexistent');
    const best = detector.getBestName('nonexistent');

    assert.equal(history, null, 'History should be null for nonexistent ID');
    assert.equal(best, null, 'Best name should be null for nonexistent ID');

    console.log(`  ✓ Empty history handled correctly`);
  });

  /**
   * Edge case: Confidence improvement (opposite of regression)
   */
  it('Edge case: Confidence improvement is not a regression', () => {
    const detector = createRegressionDetector();

    detector.trackRename('id1', 1, 'a', 0.5);
    detector.trackRename('id1', 2, 'config', 0.8); // Improvement
    detector.trackRename('id1', 3, 'configuration', 0.95); // Further improvement

    const report = detector.detectRegressions();

    assert.equal(report.regressedCount, 0, 'Improvements should not be regressions');
    console.log(`  ✓ Confidence improvements not counted as regressions`);
  });

  /**
   * Integration test: Realistic multi-pass scenario
   */
  it('Integration: Realistic multi-pass scenario', () => {
    const detector = createRegressionDetector({
      regressionThreshold: 0.1,
      policy: 'keep-best',
      warningThreshold: 0.1, // Changed from 0.15 to 0.1 to ensure warning triggers
    });

    // Simulate 3-pass processing of 20 identifiers
    // Pass 1: All identifiers get initial names (0.7 confidence)
    for (let i = 1; i <= 20; i++) {
      detector.trackRename(`id${i}`, 1, `name${i}_v1`, 0.7);
    }

    // Pass 2: Most improve, some regress
    for (let i = 1; i <= 20; i++) {
      if (i <= 3) {
        // 3 identifiers regress (15% rate > 10% threshold)
        detector.trackRename(`id${i}`, 2, `name${i}_v2`, 0.5);
      } else {
        // Rest improve
        detector.trackRename(`id${i}`, 2, `name${i}_v2`, 0.85);
      }
    }

    // Pass 3: Further improvements
    for (let i = 4; i <= 20; i++) {
      detector.trackRename(`id${i}`, 3, `name${i}_v3`, 0.9);
    }

    const report = detector.detectRegressions();
    const stats = detector.getStats();

    // Verify regression detection
    assert.equal(report.totalIdentifiers, 20);
    assert.equal(report.regressedCount, 3);
    assert.equal(report.regressionRate, 0.15);
    assert.ok(report.shouldWarn, 'Should warn when regression rate (15%) > threshold (10%)');

    // Verify stats
    assert.equal(stats.identifierCount, 20);
    assert.ok(stats.avgPassesPerIdentifier >= 2 && stats.avgPassesPerIdentifier <= 3);

    // Verify keep-best policy
    const best1 = detector.getBestName('id1'); // Regressed in pass 2
    assert.ok(best1 !== null);
    assert.equal(best1.pass, 1, 'Should keep pass 1 name (higher confidence)');

    const best10 = detector.getBestName('id10'); // Improved across passes
    assert.ok(best10 !== null);
    assert.equal(best10.pass, 3, 'Should keep pass 3 name (highest confidence)');

    console.log(`  ✓ Realistic scenario: ${report.regressedCount} regressions in ${stats.identifierCount} identifiers`);
    console.log(`  ✓ Regression rate: ${(report.regressionRate * 100).toFixed(1)}%`);
    console.log(`  ✓ Avg confidence: ${stats.avgConfidence.toFixed(3)}`);
  });

  /**
   * D6.3: getWarningMessage returns appropriate message
   */
  it('D6.3: getWarningMessage formats warning correctly', () => {
    const detector = createRegressionDetector({ warningThreshold: 0.1 }) as any; // Cast to access private method

    // Create scenario with high regression rate
    for (let i = 1; i <= 10; i++) {
      detector.trackRename(`id${i}`, 1, `name${i}_v1`, 0.8);
      if (i <= 3) {
        detector.trackRename(`id${i}`, 2, `name${i}_v2`, 0.5); // 3 regressions
      } else {
        detector.trackRename(`id${i}`, 2, `name${i}_v2`, 0.9);
      }
    }

    const report = detector.detectRegressions();
    const message = detector.getWarningMessage(report);

    assert.ok(message !== null, 'Warning message should be generated');
    assert.ok(message.includes('High churn detected'), 'Message should mention high churn');
    assert.ok(message.includes('30.0%'), 'Message should include regression rate');

    console.log(`  ✓ Warning message: ${message}`);
  });
});
